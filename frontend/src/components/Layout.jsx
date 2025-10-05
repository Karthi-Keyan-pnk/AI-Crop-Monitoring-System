import { Outlet } from "react-router-dom";
import Header from "./Header";
import ChatbotModal from "./chatbot";
import roboIcon from "../assets/bot.png"


export default function Layout() {
  return (
    <div className="app">
      <Header />
      <ChatbotModal icon={roboIcon} />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}