export const useRouter = jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
}));
export const useParams = jest.fn(() => ({}));
export const usePathname = jest.fn(() => "/");
export const redirect = jest.fn();
