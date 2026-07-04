import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Icon } from '../components/ui'
import { ROLES, ROLE_ORDER } from '../data'

const ROLE_ICON = { QT: 'settings', CB: 'doc', NTH: 'cash', KT: 'bank', LD: 'shield' }

export default function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [roleKey, setRoleKey] = useState('NTH')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')

  const submit = (e) => {
    e.preventDefault()
    login(roleKey)
    nav('/')
  }

  return (
    <div className="login-page">
      <form className="login-card wide" onSubmit={submit}>
        <div className="logo">
          <img src="/logo.png" alt="Logo xã Đông Thạnh" />
          <div className="t1">UBND XÃ ĐÔNG THẠNH — TP. HỒ CHÍ MINH</div>
          <div className="t2">
            Hệ thống quản lý &amp; thu giá dịch vụ thu gom,<br />
            vận chuyển, xử lý chất thải rắn sinh hoạt
          </div>
        </div>

        <div className="field">
          <label>Tên đăng nhập</label>
          <div className="control">
            <Icon name="user" size={16} style={{ color: 'var(--lumo-shade-40)' }} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
        </div>
        <div className="field">
          <label>Mật khẩu</label>
          <div className="control">
            <Icon name="lock" size={16} style={{ color: 'var(--lumo-shade-40)' }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
        </div>

        <div className="field">
          <label>Chọn vai trò đăng nhập (demo)</label>
        </div>
        <div className="role-grid">
          {ROLE_ORDER.map((k) => {
            const r = ROLES[k]
            return (
              <button type="button" key={k}
                className={`role-opt ${roleKey === k ? 'on' : ''}`}
                onClick={() => setRoleKey(k)}>
                <span className="role-ic"><Icon name={ROLE_ICON[k]} size={18} /></span>
                <span className="role-tx">
                  <b>{r.roleLabel.split(' — ')[0]}</b>
                  <small>{r.tag}</small>
                </span>
                {roleKey === k && <span className="role-check"><Icon name="check" size={14} /></span>}
              </button>
            )
          })}
        </div>

        <button className="btn primary lg block" type="submit" style={{ marginTop: 12 }}>
          Đăng nhập với vai <b style={{ marginLeft: 4 }}>{ROLES[roleKey].roleLabel.split(' — ')[0]}</b>
        </button>

        <div className="login-hint">
          Bản demo — tài khoản/mật khẩu điền sẵn <b>admin / admin</b>, chỉ cần <b>chọn vai trò</b> rồi Đăng nhập.
          Mỗi vai có menu &amp; chức năng riêng theo phân quyền.
        </div>
      </form>
    </div>
  )
}
