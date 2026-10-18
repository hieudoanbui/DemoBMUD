import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PhoneCard from '../components/phones/PhoneCard';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';
import SecurityTabs from '../components/common/SecurityTabs';
import { apiError } from '../api/axiosClient';

beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme; });
const phone = { id: 1, name: 'Fixture phone', brand: 'Apple', price: 1000000, storage: '128 GB', color: 'Đen', quantity: 1, description: 'Component fixture' };

describe('TC11: badge chỉ phản ánh status thật của bản ghi', () => {
  it('OFF có badge nhỏ Đang ẩn, không có nội dung khai thác', () => {
    render(<PhoneCard phone={{ ...phone, status: 'off' }} />);
    expect(screen.getByText('Đang ẩn')).toBeInTheDocument();
    expect(screen.queryByText(/SQL INJECTION/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
  });
  it('ON không có badge Đang ẩn', () => {
    render(<PhoneCard phone={{ ...phone, status: 'on' }} />);
    expect(screen.queryByText('Đang ẩn')).not.toBeInTheDocument();
  });
});

describe('TC13: route guard', () => {
  function mount(auth) {
    render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={['/products']}><Routes><Route path="/login" element={<div>Login destination</div>} /><Route element={<ProtectedRoute />}><Route path="/products" element={<div>Protected catalog</div>} /></Route></Routes></MemoryRouter></AuthContext.Provider>);
  }
  it('chưa đăng nhập chuyển tới Login', () => {
    mount({ user: null, loading: false });
    expect(screen.getByText('Login destination')).toBeInTheDocument();
    expect(screen.queryByText('Protected catalog')).not.toBeInTheDocument();
  });
  it('đã đăng nhập có thể xem products', () => {
    mount({ user: { username: 'demo' }, loading: false });
    expect(screen.getByText('Protected catalog')).toBeInTheDocument();
  });
});

it('tabs đơn giản vẫn chọn đúng chế độ, không thêm icon hoặc badge', async () => {
  const onChange = vi.fn();
  const { container } = render(<SecurityTabs mode="vulnerable" onChange={onChange} subject="đăng nhập" />);
  expect(screen.getByRole('button', { name: 'Vulnerable', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Secure', exact: true }));
  expect(onChange).toHaveBeenCalledWith('secure');
  expect(container.querySelector('svg')).toBeNull();
});

describe('theme thống nhất', () => {
  it('mặc định Light; đổi theme cập nhật DOM, cả hai toggle và localStorage', async () => {
    render(<ThemeProvider><ThemeToggle /><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    await userEvent.click(screen.getAllByRole('button', { name: 'Bật Dark Mode' })[0]);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('querylab-theme')).toBe('dark');
    expect(screen.getAllByRole('button', { name: 'Bật Light Mode' })).toHaveLength(2);
  });
  it('khôi phục lựa chọn Dark đã lưu', () => {
    localStorage.setItem('querylab-theme', 'dark');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Bật Light Mode' })).toBeInTheDocument();
  });
  it('giá trị localStorage không hợp lệ quay về Light', () => {
    localStorage.setItem('querylab-theme', 'unknown');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
  it('storage không khả dụng vẫn đổi được theme trong phiên', async () => {
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('unavailable'); });
    try {
      render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
      await userEvent.click(screen.getByRole('button', { name: 'Bật Dark Mode' }));
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    } finally { read.mockRestore(); write.mockRestore(); }
  });
});

it('lỗi hiển thị ngắn gọn, không chuyển nội dung database/debug từ backend lên UI', () => {
  expect(apiError({ response: { data: { code: 'INVALID_CREDENTIALS' } } })).toBe('Tên đăng nhập hoặc mật khẩu không đúng');
  expect(apiError({ response: { data: { error: 'Internal database hostname and SQL' } } })).toBe('Có lỗi xảy ra, vui lòng thử lại');
});
