import { useAppStore } from '../../store';
import { useVocabulary } from '../vocabulary';
export function ProgressOverview() {
  const { learned, favorites, history, daily } = useAppStore();
  const { words } = useVocabulary();
  const percent = words.length
    ? Math.round((learned.length / words.length) * 100)
    : 0;
  return (
    <>
      <div className="stats-grid">
        <div className="card">
          <small>Từ đã học</small>
          <h2>{learned.length}</h2>
        </div>
        <div className="card">
          <small>Từ đã lưu</small>
          <h2>{favorites.length}</h2>
        </div>
        <div className="card">
          <small>Lượt luyện tập</small>
          <h2>{history.length}</h2>
        </div>
      </div>
      <div className="card stack">
        <h2>Hành trình từ vựng</h2>
        <progress aria-label="Tỷ lệ từ đã học" max={100} value={percent} />
        <p>{percent}% kho từ vựng đã được khám phá.</p>
        <div className="word-grid">
          {[...new Set(words.map((w) => w.level))].map((level) => {
            const pool = words.filter((w) => w.level === level),
              count = pool.filter((w) => learned.includes(w.id)).length;
            return (
              <div className="example-block" key={level}>
                <strong>{level}</strong>
                <p>
                  {count} / {pool.length} từ
                </p>
                <progress
                  aria-label={'Tiến độ ' + level}
                  max={pool.length}
                  value={count}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h2>Hoạt động gần đây</h2>
        <div className="activity-grid">
          {Array.from({ length: 28 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 27 + i);
            const key = d.toLocaleDateString('en-CA');
            return (
              <div
                key={key}
                className={'activity-day ' + (daily[key] ? 'active' : '')}
                title={key + ': ' + (daily[key] || 0) + ' từ'}
              >
                <small>{d.getDate()}</small>
                <strong>{daily[key] || '·'}</strong>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <h2>Kết quả luyện tập</h2>
        {history.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Ngôn ngữ</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr key={item.date + i}>
                    <td>{new Date(item.date).toLocaleString('vi')}</td>
                    <td>
                      {item.language === 'zh' ? 'Tiếng Trung' : 'Tiếng Việt'}
                    </td>
                    <td>
                      {item.score} / {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            Hoàn thành một bài luyện tập để xem kết quả tại đây.
          </p>
        )}
      </div>
    </>
  );
}
