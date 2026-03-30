const VideojuegoService = require('../../src/application/VideojuegoService');

const mockVideojuegoRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn()
};
const mockBackupService = {
    runBackup: jest.fn()
};

const vjService = new VideojuegoService(mockVideojuegoRepo, mockBackupService);

describe('VideojuegoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe listar videojuegos', async () => {
        const dummyJuegos = [{ id: 1, titulo: "Zelda" }];
        mockVideojuegoRepo.findAll.mockResolvedValue(dummyJuegos);

        const result = await vjService.listarTodos();
        expect(result).toEqual(dummyJuegos);
    });

    test('debe fallar crear juego si calificacion es errónea', async () => {
        await expect(vjService.crearVideojuego({ titulo: "Halo", calificacion: 11 }))
            .rejects.toThrow("La calificación debe estar entre 1 y 10");
    });

    test('debe crear videojuego y lanzar backup', async () => {
        mockVideojuegoRepo.save.mockResolvedValue({ id: 2, titulo: "Halo", en_venta: true });
        
        const res = await vjService.crearVideojuego({ titulo: "Halo", calificacion: 9 });
        expect(res.id).toBe(2);
        expect(mockBackupService.runBackup).toHaveBeenCalled();
    });
});
