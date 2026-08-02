import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import './WelcomeScreen.css'

const WELCOME_FEATURES = [
  { icon: '🔍', text: '내 조건에 맞는 지원금만 필터링' },
  { icon: '📋', text: '자격·서류·마감일 한눈에 정리' },
  { icon: '🔔', text: '마감 임박 알림으로 놓치지 않기' },
] as const

export default function WelcomeScreen() {
  const navigate = useNavigate()

  const start = () => navigate('/onboarding/1')

  return (
    <div className="welcome screen active">
      <img src={logo} alt="지원금콕365 - 정부 지원금 매칭 서비스" className="welcome-logo" />

      <div className="welcome-features">
        {WELCOME_FEATURES.map((feat) => (
          <div key={feat.text} className="welcome-feat">
            <div className="welcome-feat-icon">{feat.icon}</div>
            <span>{feat.text}</span>
          </div>
        ))}
      </div>

      <button type="button" className="btn-start" onClick={start}>
        시작하기
      </button>
      <button type="button" className="welcome-skip" onClick={start}>
        30초면 끝나요
      </button>
    </div>
  )
}
