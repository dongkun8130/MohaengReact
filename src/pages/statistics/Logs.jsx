import { useEffect, useState } from 'react';
import {
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiAlertLine,
  RiCheckLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiWalletLine,
  RiCalendarCheckLine,
  RiServerLine,
  RiCodeLine,
  RiShieldLine,
  RiEyeLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import { Modal, ConfirmModal } from '../../components/common/Modal';
import api from '../../api/api';
import './Logs.css';

// 로그 카테고리 - 아이콘 지정
const categories = [
  { id: 'all', label: '전체', icon: RiServerLine },
  { id: 'auth', label: '인증', icon: RiUserLine },
  { id: 'payment', label: '결제', icon: RiWalletLine },
  { id: 'booking', label: '예약', icon: RiCalendarCheckLine },
  { id: 'system', label: '시스템', icon: RiServerLine },
  { id: 'product', label: '상품', icon: RiCodeLine },
  { id: 'security', label: '보안', icon: RiShieldLine }
];


// 로그 레벨
const levelConfig = {
  INFO: { icon: RiInformationLine, className: 'badge-primary', color: '#2563EB', bg: '#DBEAFE' },
  WARN: { icon: RiAlertLine, className: 'badge-warning', color: '#D97706', bg: '#FEF3C7' },
  ERROR: { icon: RiErrorWarningLine, className: 'badge-danger', color: '#DC2626', bg: '#FEE2E2' },
};

// 로그 카테고리별 ui
const categoryConfig = {
  auth: { label: '인증', color: '#2563EB', bg: '#DBEAFE' },
  payment: { label: '결제', color: '#059669', bg: '#D1FAE5' },
  booking: { label: '예약', color: '#7C3AED', bg: '#EDE9FE' },
  system: { label: '시스템', color: '#6B7280', bg: '#F3F4F6' },
  product: { label: '상품', color: '#0891B2', bg: '#CFFAFE' },
  security: { label: '보안', color: '#DC2626', bg: '#FEE2E2' }
};

// 카테고리 세팅
const getCategoryByMsg = (msg) => {
  if (!msg) return 'system'; // 메시지가 없으면 바로 system 반환

  const text = msg.toLowerCase();
  if (text.includes('login') || text.includes('인증') || text.includes('로그인')) return 'auth';
  if (text.includes('pay') || text.includes('결제')) return 'payment';
  if (text.includes('book') || text.includes('예약')) return 'booking';
  if (text.includes('product') || text.includes('accommodation') || text.includes('flight') || text.includes('tour')) return 'product';
  if (text.includes('security') || text.includes('보안') || text.includes('접근')) return 'security';
  return 'system'; // 매칭되는 게 없으면 기본값
};

// 시작일 얻기
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dataList, setDataList] = useState([]);
  const [levelFilter, setLevelFilter] = useState('all');

  // 페이징용
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [dateRange, setDateRange] = useState({
    start: getToday(),
    end: getToday()
  });
  const [pagInfo, setPagInfo] = useState({ currentPage: 1, totalPage: 1, startPage: 1, endPage: 1 });
  const [stats, setStats] = useState({ 
    TOTAL: 0, INFO: 0, WARN: 0, ERROR: 0, AUTH: 0, BOOKING: 0, PAYMENT: 0 
    , PRODUCT : 0, SECURITY : 0, SYSTEM : 0
  });

  const [detailModal, setDetailModal] = useState({ isOpen: false, log: null });

  const periods = [
    { id: 'today', label: '오늘' },
    { id: 'week', label: '이번 주' },
    { id: 'month', label: '이번 달' },
    { id: '3months', label: '최근 3개월' }
  ];

  // db에서 실제 로그목록 가져오기
  const fetchLogList = () => {
    api.get(`/admin/statistics/logs`, {
      params: {
        currentPage: currentPage,
        searchWord: searchTerm,
        searchType: categoryFilter,
        levelFilter: levelFilter,
        startDate: dateRange.start,
        endDate: dateRange.end
      }
    }).then(res => {
      // console.log("res : ", res.data.dataList);
      setDataList(res.data.dataList || []);
      setPagInfo(res.data);
      // console.log("dataList : ", dataList);
    }).catch(err => console.error("목록 로딩 실패:", err));
  };

  const fetchStats = () => {
    api.get(`/admin/statistics/logs/stats`, {
      params: { startDate: dateRange.start, endDate: dateRange.end }
    }).then(res => setStats(res.data))
      .catch(err => console.error("통계 로딩 실패:", err));
  };
 
  // 안의 값들 변할때마다 호출
  useEffect(() => {
    fetchLogList();
    fetchStats();
    console.log("stats : ", stats);
  }, [currentPage, dateRange, categoryFilter, levelFilter, searchTerm]);

  // 기간 선택 핸들러
  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    const end = getToday(); // 종료일은 무조건 오늘
    let start = new Date();

    if (periodId === 'today') {
      // 시작일 그대로 (오늘)
    } else if (periodId === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (periodId === 'month') {
      start.setMonth(start.getMonth() - 1);
    } else if (periodId === '3months') {
      start.setMonth(start.getMonth() - 3);
    }

    const startYear = start.getFullYear();
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDate = String(start.getDate()).padStart(2, '0');

    setDateRange({
      start: `${startYear}-${startMonth}-${startDate}`,
      end: end
    });
    setCurrentPage(1);   
  };

  const handleViewDetail = (log) => {
    setDetailModal({ isOpen: true, log });
  };

  const handleCategoryChange = (id) => {
    setCategoryFilter(id);
    setCurrentPage(1);
  };

  /* 페이지 시작 */
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">시스템 로그</h1>
          <p className="page-subtitle">
            시스템 활동 및 오류 로그 모니터링
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            <RiRefreshLine /> 새로고침
          </button>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="card mb-3">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {periods.map(period => (
                <button
                  key={period.id}
                  className={`btn ${selectedPeriod === period.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePeriodChange(period.id)}
                  style={{ padding: '8px 16px' }}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {/* 날짜별 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              
              <input
                type="date"
                className="form-input"
                value={dateRange.start}
                onChange={(e) => { 
                  setDateRange({ ...dateRange, start: e.target.value }); 
                  setCurrentPage(1); 
                }}
                style={{ padding: '8px 12px' }}
              />
              <span>~</span>
              <input
                type="date"
                className="form-input"
                value={dateRange.end}
                onChange={(e) => { 
                  setDateRange({ ...dateRange, end: e.target.value }); 
                  setCurrentPage(1); 
                }}
                style={{ padding: '8px 12px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label-group">
              <RiServerLine style={{ color: '#4b5563' }} />
              <span>전체 로그</span>
            </div>
            <div className="stat-value-group">
              <span>{stats.TOTAL}건</span>
              <span className="stat-percent">(100%)</span>
            </div>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: '100%', backgroundColor: '#4b5563' }} />
          </div>
        </div>

        {/* 2. INFO */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label-group">
              <RiInformationLine style={{ color: '#2563eb' }} />
              <span>INFO</span>
            </div>
            <div className="stat-value-group">
              <span>{stats.INFO}건</span>
              <span className="stat-percent">
                ({stats.TOTAL > 0 ? ((stats.INFO / stats.TOTAL) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{
              width: `${stats.TOTAL > 0 ? (stats.INFO / stats.TOTAL) * 100 : 0}%`,
              backgroundColor: '#2563eb'
            }} />
          </div>
        </div>

        {/* 3. WARNING */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label-group">
              <RiAlertLine style={{ color: '#d97706' }} />
              <span>WARN</span>
            </div>
            <div className="stat-value-group">
              <span>{stats.WARN}건</span>
              <span className="stat-percent">
                ({stats.TOTAL > 0 ? ((stats.WARN / stats.TOTAL) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{
              width: `${stats.TOTAL > 0 ? (stats.WARN / stats.TOTAL) * 100 : 0}%`,
              backgroundColor: '#d97706'
            }} />
          </div>
          {stats.WARN > 0 && <div className="stat-alert" style={{ color: '#d97706' }}>⚠️ 주의 필요</div>}
        </div>

        {/* 4. ERROR */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label-group">
              <RiErrorWarningLine style={{ color: '#dc2626' }} />
              <span>ERROR</span>
            </div>
            <div className="stat-value-group">
              <span>{stats.ERROR }건</span>
              <span className="stat-percent">
                ({stats.TOTAL > 0 ? ((stats.ERROR / stats.TOTAL) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
          <div className="progress-bg">
            <div className="progress-fill" style={{
              width: `${stats.TOTAL > 0 ? (stats.ERROR / stats.TOTAL) * 100 : 0}%`,
              backgroundColor: '#dc2626'
            }} />
          </div>
          {stats.ERROR > 0 && <div className="stat-alert" style={{ color: '#dc2626' }}>🚨 확인 필요</div>}
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const IconComponent = cat.icon;

              // 1. 카운트 계산
              const count = cat.id === 'all'
                ? stats.TOTAL
                : stats[cat.id.toUpperCase()];

              // 2. count가 0이면 아무것도 렌더링하지 않음 (null 반환)
              if (cat.id !== 'all' && count === 0) return null;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 20,
                    background: categoryFilter === cat.id ? 'var(--primary-color)' : '#F3F4F6',
                    color: categoryFilter === cat.id ? 'white' : '#6B7280',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                >
                  <IconComponent size={16} />
                  {cat.label}
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: categoryFilter === cat.id ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                    fontSize: 12
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-bar">
            <RiSearchLine className="search-bar-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="로그 메시지, 소스 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-group">
            <RiFilterLine />
            <select
              className="form-input form-select"
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 'auto' }}
            >
              <option value="all">전체 레벨</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <p style={{ padding: '12px 20px', margin: 0, background: '#F9FAFB', borderBottom: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-muted)' }}>
            검색 결과: {pagInfo.totalRecord}건
          </p>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 150 }}>시간</th>
                <th style={{ width: 90 }}>레벨</th>
                <th style={{ width: 90 }}>카테고리</th>
                <th style={{ width: 140 }}>소스</th>
                <th>메시지</th>
                <th style={{ width: 120 }}>IP</th>
                <th style={{ width: 60 }}>상세</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map(log => {
                const LevelIcon = levelConfig[log.level].icon;

                // 타입 매칭
                const keyword = getCategoryByMsg(log.msg);
                const catConfig = categoryConfig[keyword];
                const summaryMsg = log.msg.includes('에러 발생')
                  ? log.msg.split('###')[0].split(':')[0] // '에러 발생' 근처까지만 깔끔하게 자름
                  : log.msg;
                return (
                  <tr key={log.systemLogNo} style={{ background: log.level === 'ERROR' ? '#FEF2F2' : log.level === 'WARN' ? '#FFFBEB' : 'transparent' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RiTimeLine size={12} />
                        {log.regDt.split('T')[0]} {log.regDt.split('T')[1]}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: levelConfig[log.level].bg,
                          color: levelConfig[log.level].color,
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        <LevelIcon size={14} /> {log.level}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: catConfig.bg,
                        color: catConfig.color,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {catConfig.label}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: '#F3F4F6',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem'
                      }}>
                        {log.source}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {summaryMsg}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.ip}
                    </td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() => handleViewDetail(log)}
                        title="상세보기"
                      >
                        <RiEyeLine />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지 네이션 */}
        <div className="pagination">
          <button className="pagination-btn" disabled={pagInfo.startPage <= 1}
            onClick={() => setCurrentPage(pagInfo.startPage - 1)}>&lt;
          </button>
          {/* block수만큼 반복 */}
          {Array.from(
              { length: pagInfo.endPage - pagInfo.startPage + 1 },
              (_, i) => pagInfo.startPage + i
            ).map(num => (
              <button key={num}
                className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}>
                {num}
              </button>
            ))}

            <button className="pagination-btn" disabled={pagInfo.endPage >= pagInfo.totalPage}
              onClick={() => setCurrentPage(pagInfo.endPage + 1)}>&gt;
            </button>
        </div>
      </div>

      {/* 로그 상세 모달 */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, log: null })}
        title="로그 상세"
        size="medium"
      >
        {/* 여기서는 다른걸로 바꿔야됨 */}
        {detailModal.log && (() => {
          const log = detailModal.log;
          const LevelIcon = levelConfig[log.level].icon;

          // 타입 매칭
          const keyword = getCategoryByMsg(log.msg);
          const catConfig = categoryConfig[keyword];

          const summaryTitle = log.msg.includes('에러 발생')
            ? log.msg.split('###')[1] // '에러 발생' 근처까지만 깔끔하게 자름
            : log.msg;

          // console.log("catConfig : ", catConfig);
          return (
            <div>
              {/* 헤더 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: levelConfig[log.level].bg,
                borderRadius: 8,
                marginBottom: 20
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LevelIcon size={24} style={{ color: levelConfig[log.level].color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {log.msg.includes('에러 발생') ? '' : log.msg}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: levelConfig[log.level].color,
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {log.level}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: catConfig.bg,
                      color: catConfig.color,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      {catConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="detail-list">
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}><RiTimeLine style={{ marginRight: 8 }} />발생 시간</span>
                  <span style={{ fontFamily: 'monospace' }}>{log.regDt.split('T')[0]} {log.regDt.split('T')[1]}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}><RiServerLine style={{ marginRight: 8 }} />소스</span>
                  <span style={{ fontFamily: 'monospace', padding: '2px 8px', background: '#F3F4F6', borderRadius: 4 }}>{log.source}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}><RiUserLine style={{ marginRight: 8 }} />사용자 ID</span>
                  <span style={{ fontFamily: 'monospace' }}>{log.systemLogMem}</span>
                </div>
                <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}><RiShieldLine style={{ marginRight: 8 }} />IP 주소</span>
                  <span style={{ fontFamily: 'monospace' }}>{log.ip}</span>
                </div>
              </div>

              {/* 상세 내용 */}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>상세 내용</h4>
                <div style={{
                  padding: 16,
                  background: '#1E293B',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#E2E8F0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {summaryTitle}
                </div>
              </div>

              {/* 액션 버튼 (에러인 경우) */}
              {log.level === 'ERROR' && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: '#FEF2F2',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ color: '#DC2626', fontSize: 14 }}>
                    <RiAlertLine style={{ marginRight: 8 }} />
                    이 에러에 대한 조치가 필요합니다.
                  </div>
                  <button className="btn btn-danger btn-sm">이슈 생성</button>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>


    </div>
  );
}

export default Logs;
