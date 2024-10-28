import Image from "next/image";
import logo from "@/../public/wordless.png";

export default function Header() {
  return <div className="h-16 shadow-md sticky top-0 z-50 border-b-2 border-slate-500 text-white flex items-center justify-center">
    <Image src={logo} alt="logo" width={32} height={32} className="mr-2" />
    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Wordless</h1>
  </div>;
}
