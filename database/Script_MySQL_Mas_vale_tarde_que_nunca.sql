-- ============================================================
-- Proyecto: Más vale tarde que nunca
-- Institución: I.E. Rural Santa María (El Carmen de Viboral, Antioquia)
-- Motor: MySQL 8.x
-- Descripción: registro de llegadas tarde de estudiantes de grado 11
--              y gestión de permisos de ingreso a clase.
-- ============================================================

CREATE DATABASE IF NOT EXISTS mas_vale_tarde
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mas_vale_tarde;

-- Se eliminan en orden inverso de dependencia para poder re-ejecutar el script
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS llegadas_tarde;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS usuarios;

-- ------------------------------------------------------------
-- Usuarios del sistema: docentes (registran) y coordinador (autoriza)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  correo         VARCHAR(120) NOT NULL UNIQUE,
  contrasena     VARCHAR(255) NOT NULL COMMENT 'Se guarda cifrada (hash), nunca en texto plano',
  rol            ENUM('docente','coordinador','rector') NOT NULL DEFAULT 'docente',
  activo         TINYINT(1) NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Estudiantes de grado 11 (grupo piloto)
-- ------------------------------------------------------------
CREATE TABLE estudiantes (
  id_estudiante  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  documento      VARCHAR(20)  NOT NULL UNIQUE,
  nombres        VARCHAR(80)  NOT NULL,
  apellidos      VARCHAR(80)  NOT NULL,
  grado          VARCHAR(5)   NOT NULL DEFAULT '11',
  grupo          VARCHAR(5)   NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_estudiante_apellidos (apellidos, nombres)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Llegadas tarde: fecha y hora automáticas, motivo opcional
-- ------------------------------------------------------------
CREATE TABLE llegadas_tarde (
  id_llegada     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_estudiante  INT UNSIGNED NOT NULL,
  id_docente     INT UNSIGNED NOT NULL COMMENT 'Usuario que registra la llegada',
  fecha_hora     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo         VARCHAR(255) NULL,
  estado         ENUM('pendiente','autorizada','no_autorizada') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_llegada_estudiante FOREIGN KEY (id_estudiante)
    REFERENCES estudiantes(id_estudiante) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_llegada_docente FOREIGN KEY (id_docente)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_llegada_fecha (fecha_hora),
  INDEX idx_llegada_estado (estado)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Permisos: decisión del coordinador sobre cada llegada tarde (1 a 1)
-- ------------------------------------------------------------
CREATE TABLE permisos (
  id_permiso     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_llegada     INT UNSIGNED NOT NULL UNIQUE,
  id_coordinador INT UNSIGNED NOT NULL,
  decision       ENUM('autorizada','no_autorizada') NOT NULL,
  observacion    VARCHAR(255) NULL,
  fecha_decision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permiso_llegada FOREIGN KEY (id_llegada)
    REFERENCES llegadas_tarde(id_llegada) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_permiso_coordinador FOREIGN KEY (id_coordinador)
    REFERENCES usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Vista de reincidentes: estudiantes con 3 o más llegadas tarde
-- (el umbral puede ajustarse con la coordinación)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_reincidentes AS
SELECT e.id_estudiante,
       e.documento,
       CONCAT(e.nombres, ' ', e.apellidos) AS estudiante,
       COUNT(l.id_llegada)                 AS total_llegadas,
       MAX(l.fecha_hora)                   AS ultima_llegada
FROM estudiantes e
JOIN llegadas_tarde l ON l.id_estudiante = e.id_estudiante
GROUP BY e.id_estudiante, e.documento, e.nombres, e.apellidos
HAVING COUNT(l.id_llegada) >= 3;

-- ------------------------------------------------------------
-- Datos de ejemplo (ficticios) para probar el sistema
-- La contraseña de ejemplo NO es real: reemplazar por un hash generado en el backend.
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
  ('Coordinador de ejemplo', 'coordinador@ejemplo.com', 'REEMPLAZAR_POR_HASH', 'coordinador'),
  ('Docente de ejemplo',     'docente@ejemplo.com',     'REEMPLAZAR_POR_HASH', 'docente');

INSERT INTO estudiantes (documento, nombres, apellidos, grado, grupo) VALUES
  ('1000000001', 'Estudiante', 'Uno',  '11', '11-A'),
  ('1000000002', 'Estudiante', 'Dos',  '11', '11-A'),
  ('1000000003', 'Estudiante', 'Tres', '11', '11-B');

INSERT INTO llegadas_tarde (id_estudiante, id_docente, fecha_hora, motivo, estado) VALUES
  (1, 2, '2026-10-05 07:20:00', 'Transporte retrasado', 'autorizada'),
  (1, 2, '2026-10-06 07:25:00', 'Lluvia',               'autorizada'),
  (1, 2, '2026-10-07 07:30:00', NULL,                   'pendiente'),
  (2, 2, '2026-10-06 07:15:00', 'Se quedó dormido',     'no_autorizada');

INSERT INTO permisos (id_llegada, id_coordinador, decision, observacion) VALUES
  (1, 1, 'autorizada',    'Problema de transporte verificado'),
  (2, 1, 'autorizada',    'Lluvia fuerte en la vereda'),
  (4, 1, 'no_autorizada', 'Sin justificación');
