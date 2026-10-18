import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PhoneCard from '../components/phones/PhoneCard';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';
import SecurityTabs from '../components/common/SecurityTabs';
import QueryViewer from '../components/common/QueryViewer';

const phone = { id: 1, name: 'Fixture phone', brand: 'Apple', price: 1000000, storage: '128 GB', color: 'Đen', quantity: 1, description: 'Component fixture' };
describe('TC11: product badge phản ánh status của bản ghi, không dựa vào nút payload', () => {
  it('hiện badge HIDDEN cho sản phẩm OFF', () => {
    render(<PhoneCard phone={{ ...phone, status: 'off' }} />);
    expect(screen.getByText('HIDDEN – EXPOSED BY SQL INJECTION')).toBeInTheDocument();
  });
  it('không hiện badge HIDDEN cho sản phẩm ON', () => {
    render(<PhoneCard phone={{ ...phone, status: 'on' }} />);
    expect(screen.queryByText('HIDDEN – EXPOSED BY SQL INJECTION')).not.toBeInTheDocument();
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
it('chuyển chế độ gọi callback và trạng thái nút có thể truy cập', async () => {
  const onChange = vi.fn();
  render(<SecurityTabs mode="vulnerable" onChange={onChange} subject="Login" />);
  expect(screen.getByRole('button', { name: 'Vulnerable Login' })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Secure Login' }));
  expect(onChange).toHaveBeenCalledWith('secure');
});
it('Query Viewer chưa thực thi không tự tạo kết quả database', () => {
  render(<QueryViewer mode="vulnerable" kind="login" trace={null} />);
  expect(screen.getByText('AWAITING INPUT')).toBeInTheDocument();
  expect(screen.getByText(/Chưa thực thi/)).toBeInTheDocument();
  expect(screen.queryByText('EXECUTED')).not.toBeInTheDocument();
});
