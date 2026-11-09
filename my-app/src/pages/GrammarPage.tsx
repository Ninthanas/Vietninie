import { GrammarList } from '../features/grammar';
export default function GrammarPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">HIỂU CẤU TRÚC, NÓI TỰ NHIÊN</p>
        <h1>Ngữ pháp trong đời sống</h1>
        <p>Giải thích dễ hiểu, ví dụ gần gũi và luyện tập ngay.</p>
      </div>
      <GrammarList />
    </>
  );
}
