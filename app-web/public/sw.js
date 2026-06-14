// Service worker mínimo: habilita instalación PWA. Sin estrategia de cache por ahora.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Passthrough; el caching offline llega en un plan posterior.
});
