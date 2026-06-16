import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatView } from "@/components/chat/ChatView";

const messages = [
  { id: "m1", user_id: "u1", display_name: "Sofía", body: "¡Gané hoy!", created_at: "t1" },
  { id: "m2", user_id: "me", display_name: "Fran", body: "Por poco", created_at: "t2" },
];

describe("ChatView", () => {
  it("muestra los mensajes", () => {
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={() => {}} onReact={() => {}} />);
    expect(screen.getByText("¡Gané hoy!")).toBeInTheDocument();
    expect(screen.getByText("Por poco")).toBeInTheDocument();
  });
  it("envía un mensaje", () => {
    const onSend = vi.fn();
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={onSend} onReact={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/mensaje/i), { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    expect(onSend).toHaveBeenCalledWith("hola");
  });
  it("al mantener presionado (o clic derecho) abre el selector y reacciona", () => {
    const onReact = vi.fn();
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={() => {}} onReact={onReact} />);
    // Sin interacción no hay botones de emoji visibles (interfaz limpia).
    expect(screen.queryByRole("button", { name: "🔥" })).not.toBeInTheDocument();
    // Mantener presionado se simula con el menú contextual.
    fireEvent.contextMenu(screen.getByText("¡Gané hoy!"));
    fireEvent.click(screen.getByRole("button", { name: "🔥" }));
    expect(onReact).toHaveBeenCalledWith("m1", "🔥");
  });

  it("muestra solo las reacciones que ya tiene un mensaje", () => {
    render(
      <ChatView
        messages={messages}
        myUserId="me"
        reactionCounts={{ m1: { "❤️": 2 } }}
        onSend={() => {}}
        onReact={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "❤️ 2" })).toBeInTheDocument();
    // El resto de emojis no aparece hasta abrir el selector.
    expect(screen.queryByRole("button", { name: "🔥" })).not.toBeInTheDocument();
  });
});
