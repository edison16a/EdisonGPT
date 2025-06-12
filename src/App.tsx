import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import gpt from "./gpt.png";
import "./index.css";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import OpenAI from "openai";

/* ---------- OpenAI setup ---------- */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const NAME = "Anonymous User";
const BOT_NAME = "Edison GPT";

export default function App() {
  /* ---------- Convex hooks ---------- */
  const messages     = useQuery(api.chat.getMessages);
  const sendMessage  = useMutation(api.chat.sendMessage);

  /* ---------- Local state ---------- */
  const [newMessageText, setNewMessageText] = useState("");
  const [tosAccepted,    setTosAccepted]    = useState<boolean>(() => {
    // read once on mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("tosAccepted") === "true";
    }
    return false;
  });

  /* ---------- Helper: fetch ChatGPT reply ---------- */
  const getBotReply = async (prompt: string) => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [{ role: "user", content: prompt }],
      });
      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) {
        await sendMessage({ user: BOT_NAME, body: reply });
        console.log(reply);
      }
    } catch (err) {
      console.error("OpenAI error:", err);
    } finally {
      console.log("Done");
    }
  };

  /* ---------- Auto-scroll after each render ---------- */
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [messages]);

  /* ---------- Accept-TOS handler ---------- */
  const acknowledgeTOS = () => {
    localStorage.setItem("tosAccepted", "true");
    setTosAccepted(true);
  };

  /* ---------- Render ---------- */
  return (
    <>
      {/* ---------- TOS modal ---------- */}
      {!tosAccepted && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Hold up! 📜</h2>
            <p>
              Everything you type in this chat is <strong>stored permanently</strong> in a Convex
              database and will be available for anyone to see.
              <br />
              If that’s cool with you, tap <em>I understand</em> to continue.
            </p>
            <button onClick={acknowledgeTOS}>I understand</button>
          </div>
        </div>
      )}

      {/* ---------- Chat UI ---------- */}
      <main className="chat" aria-hidden={!tosAccepted}>
        <header>
          <h1>Edison Global Convex AI Chat</h1>
          <p>
            Connected as <strong>{NAME}</strong>
          </p>
        </header>

        {messages?.map((message) => (
          <article
            key={message._id}
            className={message.user === NAME ? "message-mine" : ""}
          >
            <div className="row">
              {message.user === BOT_NAME && (
                <img src={gpt} alt={BOT_NAME} width={32} height={32} />
              )}
              <div>{message.user}</div>
            </div>
            <p>{message.body}</p>
          </article>
        ))}

        {/* hide form until TOS is accepted */}
        {tosAccepted && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await sendMessage({ user: NAME, body: newMessageText });
              await getBotReply(newMessageText);
              console.log("Got Bot Reply");
              setNewMessageText("");
            }}
          >
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Ask Something…"
              autoFocus
            />
            <button type="submit" disabled={!newMessageText}>
              Send
            </button>
          </form>
        )}
      </main>
    </>
  );
}
