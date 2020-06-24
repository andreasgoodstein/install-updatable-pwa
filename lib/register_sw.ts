const UPDATE_KEY = "pwaHasUpdate";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register(
      "./service_worker.ts"
    );

    registration.onupdatefound = serviceWorkerUpdate;
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data === UPDATE_KEY) {
      handlePWAUpdate();
    }
  });
}

function serviceWorkerUpdate(this: ServiceWorkerRegistration) {
  const { installing } = this;

  if (!installing) {
    return;
  }

  installing.onstatechange = () => {
    if (installing.state === "installed") {
      handlePWAUpdate();
    }
  };
}

function handlePWAUpdate() {
  // implement handling logic
  console.warn("PWA has update, but no way of handling it...");
}
