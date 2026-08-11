export default function SiteFooter() {
  return (
    <footer className="mt-4 bg-black px-6 py-10 text-center">
      <p className="text-sm font-bold text-white">벨루아랩(Valualab)</p>
      <div className="mx-auto mt-4 flex max-w-md flex-col gap-1.5 text-xs leading-relaxed text-gray-400">
        <p>Business Registration Number: 102-03-84971</p>
        <p>CEO: SangHyeok Park</p>
        <p>Address: 88-21 Yonghyeon-dong, Michuhol-gu, Incheon</p>
        <p>서비스 문의: 공식 인스타그램 DM</p>
        <p>Customer Service: 050-6485-9701</p>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 text-xs text-gray-500">
        <span>서비스 이용약관</span>
        <span className="text-gray-700">|</span>
        <span>개인정보 처리방침</span>
      </div>
    </footer>
  );
}
