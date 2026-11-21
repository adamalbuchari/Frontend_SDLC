import { useState, type ReactNode } from "react";
import SDLCTemplatesPage from "./SDLCTemplatesPage";

type AdministrationSection = "users" | "sdlc";

export default function AdministrationPage({
  usersContent,
}: {
  usersContent: ReactNode;
}) {
  const [section, setSection] = useState<AdministrationSection>("users");

  return (
    <div>
      <div className="table-toolbar" style={{ marginBottom: 18 }}>
        <div className="row-actions">
          <button
            type="button"
            className={`btn ${
              section === "users" ? "primary" : "secondary"
            } small`}
            onClick={() => setSection("users")}
          >
            Users &amp; Access
          </button>

          <button
            type="button"
            className={`btn ${
              section === "sdlc" ? "primary" : "secondary"
            } small`}
            onClick={() => setSection("sdlc")}
          >
            SDLC Template
          </button>
        </div>
      </div>

      {section === "users" ? usersContent : <SDLCTemplatesPage />}
    </div>
  );
}
