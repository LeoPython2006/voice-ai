export default function Setup() {
  return (
    <div className="absolute inset-0 grid place-content-center text-center p-4">
      <div>
        <h1 className="text-2xl mb-4">Missing credentials</h1>
        <p className="opacity-80">
          Add your Hume API keys to a <code>.env.local</code> file then restart
          the dev server.
        </p>
      </div>
    </div>
  );
}
