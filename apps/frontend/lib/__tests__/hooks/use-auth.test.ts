import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../../../hooks/use-auth";
import { useAuthStore } from "@/store";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock zustand store
jest.mock("@/store", () => ({
  useAuthStore: jest.fn(),
}));

describe("useAuth Hook", () => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
    mockLocalStorage.clear();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup zustand store mock
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });
  });

  it("should login user", () => {
    // Arrange
    const mockUser = {
      id: "123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: "customer" as const,
      isEmailVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const { result } = renderHook(() => useAuth());

    // Act
    act(() => {
      result.current.login(mockUser);
    });

    // Assert
    expect(mockLogin).toHaveBeenCalledWith(mockUser);
  });

  it("should logout user", () => {
    // Arrange
    const { result } = renderHook(() => useAuth());

    // Act
    act(() => {
      result.current.logout();
    });

    // Assert
    expect(mockLogout).toHaveBeenCalled();
  });

  it("should return auth state and methods", () => {
    // Arrange
    const mockUser = {
      id: "123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: "customer" as const,
      isEmailVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current).toEqual({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: expect.any(Function),
      logout: expect.any(Function),
    });
  });
});
