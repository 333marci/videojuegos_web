const AuthService = require('../../src/application/AuthService');

// Mocks
const mockUsuarioRepo = {
    findByUsernameOrEmail: jest.fn(),
    findByUsername: jest.fn(),
    save: jest.fn()
};
const mockHashService = {
    hash: jest.fn(),
    compare: jest.fn()
};
const mockTokenService = {
    sign: jest.fn()
};
const mockBackupService = {
    runBackup: jest.fn()
};

const authService = new AuthService(mockUsuarioRepo, mockHashService, mockTokenService, mockBackupService);

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe fallar el login si usuario no existe', async () => {
        mockUsuarioRepo.findByUsername.mockResolvedValue(null);
        
        await expect(authService.login({ username: 'test', password: '123' }))
            .rejects.toThrow("Usuario no encontrado");
    });

    test('debe permitir login con datos correctos', async () => {
        const fakeUser = {
            id: 1,
            username: 'test',
            password_hash: 'hashed',
            esAdministrador: () => false
        };
        mockUsuarioRepo.findByUsername.mockResolvedValue(fakeUser);
        mockHashService.compare.mockResolvedValue(true);
        mockTokenService.sign.mockReturnValue("jwt-token-fake");

        const result = await authService.login({ username: 'test', password: '123' });

        expect(result.token).toBe("jwt-token-fake");
        expect(result.usuario.username).toBe('test');
    });

    test('debe rechazar registro si email/username ya existe', async () => {
        mockUsuarioRepo.findByUsernameOrEmail.mockResolvedValue(true); // it exists!

        await expect(authService.registrar({
            username: 'test', password: '123', nombre_completo: 'Test', email: 't@t.com'
        })).rejects.toThrow("El nombre de usuario o email ya está registrado");
    });

    test('debe registrar exitosamente', async () => {
        mockUsuarioRepo.findByUsernameOrEmail.mockResolvedValue(false);
        mockHashService.hash.mockResolvedValue("hashedpass");
        mockUsuarioRepo.save.mockResolvedValue(99);

        const newId = await authService.registrar({
            username: 'newuser', password: 'abc', nombre_completo: 'New User', email: 'new@use.com'
        });

        expect(newId).toBe(99);
        expect(mockUsuarioRepo.save).toHaveBeenCalled();
        expect(mockBackupService.runBackup).toHaveBeenCalled();
    });
});
