-- Script de respaldo automático GameHub
CREATE DATABASE IF NOT EXISTS videojuegos_db;
USE videojuegos_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS biblioteca;
DROP TABLE IF EXISTS resenas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS videojuegos;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE videojuegos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  desarrollador VARCHAR(255),
  genero VARCHAR(100),
  anio_lanzamiento INT,
  calificacion DECIMAL(3,1),
  descripcion TEXT,
  precio DECIMAL(10,2),
  en_venta BOOLEAN DEFAULT TRUE,
  imagen_url TEXT,
  enlace_compra TEXT,
  plataforma VARCHAR(255),
  motor VARCHAR(255),
  duracion VARCHAR(100),
  popularidad INT DEFAULT 0
);

INSERT INTO videojuegos (id, titulo, desarrollador, genero, anio_lanzamiento, calificacion, descripcion, precio, en_venta, imagen_url, enlace_compra, plataforma, motor, duracion, popularidad) VALUES 
(1, 'Elden Ring', 'FromSoftware', 'Acci├│n RPG', 2022, 10, 'Explora las Tierras Intermedias.', 59.99, 0, 'https://imgs.search.brave.com/SURZwdns-bi9yiBN-LQxfBHwHYcXGnG0yuFaYSvD0VA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/ZWxkZW4tcmluZy1j/b3Zlci1pbnNwaXJh/dGlvbnMtdjAtN211/b3NqNnU3czRlMS5q/cGc_d2lkdGg9Mzg0/MCZmb3JtYXQ9cGpw/ZyZhdXRvPXdlYnAm/cz0yMGUwMzg3ZjVh/YmFlY2FiYjZjMTdk/ZWY0ZTY0MmNjNWNl/ZTUxNWQz', 'https://store.steampowered.com/app/1245620/ELDEN_RING/', 'PC, PS5, Xbox Series X/S', 'RE Engine (Modified)', '60h-120h', 1500),
(2, 'Minecraft', 'Mojang Studios', 'Sandbox', 2011, 8, 'Mundo de bloques infinito.', 24.99, 0, 'https://imgs.search.brave.com/MDi2CJe0BkMNmcENob5E_fo4SgzfMQMilCuCmwSg4hE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/d2hpY2gtb25lLWlz/LXRoZS1zdXBlcmlv/ci1jb3Zlci1hcnQt/djAtZzR1cnIyZDh6/dTNkMS5wbmc_d2lk/dGg9NjQwJmNyb3A9/c21hcnQmYXV0bz13/ZWJwJnM9MTQ3YTM2/NjNhMzA3NGEwZWI4/OWM2N2YzZGE3ZjJh/NmEyYzdjZWU0ZQ', 'https://www.minecraft.net/', 'PC, Mobile, Console', 'Java / Bedrock', 'Infinita', 5000),
(3, 'Cyberpunk 2077', 'CD Projekt Red', 'RPG', 2020, 8, 'Ciudad futurista distópica.', 54.99, 0, 'https://imgs.search.brave.com/EB3_6XLiVkqCBg_7x7eFxke2arFsQtx95yq6OCM2hyo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZW5lcy4yMG1pbnV0/b3MuZXMvZmlsZXMv/aW1hZ2VfOTkwXzU1/Ni91cGxvYWRzL2lt/YWdlbmVzLzIwMjAv/MTIvMTAvcG9ydGFk/YS1kZS1jeWJlcnB1/bmstMjA3Ny5qcGVn', 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/', 'PC, PS5, Xbox Series X/S', 'REDengine 4', '25h-100h', 2200),
(4, 'Black Myth: Wukong', 'Game Science', 'Acci├│n RPG', 2024, 9.3, 'Basado en el Viaje al Oeste.', 59.99, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/capsule_616x353.jpg', 'https://store.steampowered.com/app/2358720/Black_Myth_Wukong/', 'PC, PS5', 'Unreal Engine 5', '40h-70h', 3500),
(5, 'Baldur''s Gate 3', 'Larian Studios', 'RPG', 2023, 9.6, 'La experiencia definitiva de D&D.', 59.99, 1, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_616x353.jpg', 'https://store.steampowered.com/app/1086940/Baldurs_Gate_3/', 'PC, PS5, Xbox Series X/S', 'Divinity 4.0', '100h-200h', 4200),
(6, 'Alan Wake 2', 'Remedy Entertainment', 'Survival Horror', 2023, 9, 'Una pesadilla psicol├│gica.', 49.99, 0, 'https://imgs.search.brave.com/rKIsE5JAVtzuLXe6G4xb8XOnuk7TNzpD_O0oJX1NbOQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLjNk/anVlZ29zLmNvbS9q/dWVnb3MvODg5NC9h/bGFuX3dha2VfMl9f/MjAxMl8vZm90b3Mv/ZmljaGEvYWxhbl93/YWtlXzJfXzIwMTJf/LTU4MzA5NDIud2Vi/cA', 'https://www.epicgames.com/store/en-US/p/alan-wake-2', 'PC, PS5, Xbox Series X/S', 'Northlight', '20h-40h', 1800),
(7, 'God of War Ragnarok', 'Santa Monica Studio', 'Acci├│n', 2022, 9.3, 'El invierno n├│rdico llega.', 69.99, 0, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/capsule_616x353.jpg', 'https://store.steampowered.com/app/2322010/God_of_War_Ragnark/', 'PC, PS5, PS4', 'Custom Engine', '40h-85h', 2800),
(8, 'Stellar Blade', 'Shift Up', 'Acción', 2024, 8, 'Combate estilizado y visuales de ├®lite.', 69.99, 0, 'https://imgs.search.brave.com/H3zv6ZlPzvTg10h5wPAtJ_9NtNYUBBveCg6BIWSMnCk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2FmLzc1/LzNhL2FmNzUzYTA1/MjUwNTVmZWNlOGZi/OTFmNGM1ZDk3MjJm/LmpwZw', 'https://www.playstation.com/es-es/games/stellar-blade/', 'PS5', 'Unreal Engine 4', '30h-50h', 1200),
(9, 'Hades II', 'Supergiant Games', 'Roguelike', 2024, 9, 'La princesa del Inframundo despierta.', 28.99, 0, 'https://imgs.search.brave.com/4TtQ40HCSpAxWeFlq60J47RghvrI2Dl3iH3-4ZrkvfY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZW4ubmV4dG4uZXMv/d3AtY29udGVudC91/cGxvYWRzLzIwMjIv/MTIvMjIxMi0wOS1I/YWRlcy1JSS0wMS5q/cGc_c3RyaXA9YWxs/JnNoYXJwPTE', 'https://store.steampowered.com/app/1145350/Hades_II/', 'PC', 'Custom', '50h-150h', 3100),
(10, 'Tekken 8', 'Bandai Namco', 'Lucha', 2024, 8, 'La nueva generación de lucha.', 69.99, 0, 'https://imgs.search.brave.com/74Bsj1AnD5mDEcRjsYuNMYvyGj1xcSLsgqv9v8WvgyY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHNpby5nbndjZG4u/Y29tL2NvN2xiYl9v/dVNUc3VyLmpwZz93/aWR0aD0yMDQ4Jmhl/aWdodD0yMDQ4JmZp/dD1ib3VuZHMmcXVh/bGl0eT04NSZmb3Jt/YXQ9anBnJmF1dG89/d2VicA', 'https://store.steampowered.com/app/1778820/TEKKEN_8/', 'PC, PS5, Xbox Series X/S', 'Unreal Engine 5', '10h-Xh', 1100),
(11, 'Starfield', 'Bethesda Game Studios', 'RPG Espacial', 2023, 7.5, 'Explora las estrellas.', 69.99, 0, 'https://imgs.search.brave.com/AuTij1ys1Opi24EBN7iPIh9EOZ1FzSqGiDTk5PW3aw0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLjNk/anVlZ29zLmNvbS9q/dWVnb3MvMTU5NTYv/c3RhcmZpZWxkL2Zv/dG9zL2ZpY2hhL3N0/YXJmaWVsZC01ODM2/NDY3LndlYnA', 'https://store.steampowered.com/app/1716740/Starfield/', 'PC, Xbox Series X/S', 'Creation Engine 2', '50h-200h', 1900),
(12, 'Ghost of Tsushima', 'Sucker Punch', 'Acción', 2020, 9, 'El honor de un samur├íi.', 59.99, 0, 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/capsule_616x353.jpg', 'https://store.steampowered.com/app/2215430/Ghost_of_Tsushima_DIRECTORS_CUT/', 'PC, PS5, PS4', 'Custom', '30h-60h', 2100),
(13, 'Final Fantasy VII Rebirth', 'Square Enix', 'RPG', 2024, 9.5, 'El viaje m├ís all├í de Midgar.', 79.99, 0, 'https://imgs.search.brave.com/mxJ6Skw5f2N4gmyZDjGetPmJUwAh3nQsPv4Dgc8Ypwk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHNpby5nbndjZG4u/Y29tL2NvNzNqdV9q/N0VDUHdPLmpwZz93/aWR0aD0yMDQ4Jmhl/aWdodD0yMDQ4JmZp/dD1ib3VuZHMmcXVh/bGl0eT04NSZmb3Jt/YXQ9anBnJmF1dG89/d2VicA', 'https://www.playstation.com/es-es/games/final-fantasy-vii-rebirth/', 'PS5', 'Unreal Engine 4', '80h-150h', 2400);

CREATE TABLE usuarios (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE, password_hash VARCHAR(255), nombre_completo VARCHAR(100), email VARCHAR(100) UNIQUE, biografia TEXT, avatar_url VARCHAR(255), es_admin BOOLEAN DEFAULT FALSE, fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE resenas (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, puntuacion INT, comentario TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);
CREATE TABLE biblioteca (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT, videojuego_id INT, fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, FOREIGN KEY (videojuego_id) REFERENCES videojuegos(id) ON DELETE CASCADE);
