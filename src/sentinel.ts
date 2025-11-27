export function createSentinel(
  type: "top" | "bottom",
  debug: boolean,
): HTMLElement {
  const sentinel = document.createElement("div");
  sentinel.classList.add(`sticky-sentinel-${type}`);

  const style: Partial<CSSStyleDeclaration> = {
    position: "absolute",
    height: "10px",
    left: "0",
    right: "0",
    pointerEvents: "none",
    visibility: "hidden",
  };

  if (type === "top") {
    style.top = "0";
  } else {
    style.bottom = "0";
  }

  if (debug) {
    Object.assign(style, {
      visibility: "visible",
      zIndex: "9999",
      opacity: "0.5",
      backgroundColor: type === "top" ? "green" : "red",
      border: "1px solid black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      color: "white",
      fontWeight: "bold",
    });
    sentinel.textContent = type.toUpperCase();
  }

  Object.assign(sentinel.style, style);
  return sentinel;
}
