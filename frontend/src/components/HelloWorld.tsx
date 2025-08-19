import "../css/HelloWorld.css";

function HelloWorld() {
  return (
    <div className="hello-world-container">
      <div className="code-line">
        <span style={{ color: "#e4bb68" }}>System</span>
        <span style={{ color: "white" }}>.</span>
        <span style={{ color: "#e06c75" }}>out</span>
        <span style={{ color: "white" }}>.</span>
        <span style={{ color: "#61afef" }}>println</span>
        <span style={{ color: "white" }}>("</span>
        
        <div className="animated-text">
          <span className="greeting en">Hello World!</span>
          <span className="greeting es">¡Hola Mundo!</span>
          <span className="greeting de">Hallo Welt!</span>
          <span className="greeting it">Ciao Mondo!</span>
        </div>
        
        <span style={{ color: "white" }}>"</span>
        <span style={{ color: "white" }}>);</span>
      </div>
    </div>
  );
}

export default HelloWorld;