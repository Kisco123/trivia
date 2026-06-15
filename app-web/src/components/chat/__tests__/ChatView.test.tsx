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
  it("reacciona a un mensaje", () => {
    const onReact = vi.fn();
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={() => {}} onReact={onReact} />);
    fireEvent.click(screen.getAllByRole("button", { name: "🔥" })[0]);
    expect(onReact).toHaveBeenCalledWith("m1", "🔥");
  });
});
