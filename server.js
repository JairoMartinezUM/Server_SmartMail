// backend/server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'tu_secreto_super_seguro_2025'; // Cambia esto en producción

// === Configuración de SQL Server ===
const config = {
  user: 'Pagina',
  password: '987654321',
  server: 'JAIRO_PC\\JAIRO_MARTINEZ',
  database: 'APP WEB PRUEBAS',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('Error en el pool de SQL Server:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// === Rutas ===

// Probar conexión
app.get('/api/test', async (req, res) => {
  try {
    await poolConnect;
    res.json({ message: 'Conexión exitosa a SQL Server' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query('SELECT ID, Usuario, Contrasena FROM Usuarios WHERE Usuario = @usuario');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const esValida = await bcrypt.compare(contrasena, user.Contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: user.ID, usuario: user.Usuario }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// Obtener todos los registros
app.get('/api/registros', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query`
      SELECT
        c.CarreraID,
        c.NombreCarrera AS Carrera,
        EA.Year AS Año,
        EA.NumeroIngresos AS Ingresos,
        EA.NumeroEgresados AS Egresos
      FROM dbo.EstadisticasAcademicas AS EA
      INNER JOIN dbo.Carreras AS C ON EA.CarreraID = C.CarreraID`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar nuevo dato
app.post('/api/registros', async (req, res) => {
  const { carreraId, año, ingresos, egresos } = req.body;
  if (!carreraId || !año || ingresos == null || egresos == null) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  try {
    await poolConnect;
    await pool.request()
      .input('carreraId', sql.Int, carreraId)
      .input('año', sql.Int, año)
      .input('ingresos', sql.Int, ingresos)
      .input('egresos', sql.Int, egresos)
      .query`INSERT INTO EstadisticasAcademicas (CarreraID, Year, NumeroIngresos, NumeroEgresados)
             VALUES (@carreraId, @año, @ingresos, @egresos)`;
    res.status(201).json({ message: 'Registro guardado.' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Ya existe un registro para esa carrera y año.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// === Regresión Lineal Múltiple (sin dependencias externas) ===
function solveLinearRegression(X, y) {
  const n = X.length;
  const p = X[0].length;
  const Xt = X[0].map((_, i) => X.map(row => row[i]));
  const XtX = Xt.map(row => Xt[0].map((_, j) => row.reduce((sum, val, k) => sum + val * Xt[k][j], 0)));
  const Xty = Xt.map(row => row.reduce((sum, val, i) => sum + val * y[i], 0));

  const A = XtX.map((row, i) => [...row, Xty[i]]);
  const m = A.length;

  // Eliminación gaussiana
  for (let i = 0; i < m; i++) {
    let maxRow = i;
    for (let k = i + 1; k < m; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];

    for (let k = i + 1; k < m; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j <= m; j++) {
        if (i === j) A[k][j] = 0;
        else A[k][j] += c * A[i][j];
      }
    }
  }

  // Sustitución hacia atrás
  const beta = new Array(m);
  for (let i = m - 1; i >= 0; i--) {
    beta[i] = A[i][m] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      A[k][m] -= A[k][i] * beta[i];
    }
  }

  // Cálculo de R²
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  const yPred = X.map(row => row.reduce((sum, val, i) => sum + val * beta[i], 0));
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const rSquared = 1 - ssRes / ssTot;

  return { coefficients: beta, rSquared };
}

app.post('/api/regresion', (req, res) => {
  try {
    const { x_values, y_values } = req.body;

    if (!Array.isArray(x_values) || !Array.isArray(y_values)) {
      return res.status(400).json({ error: 'x_values y y_values deben ser arrays.' });
    }
    if (x_values.length === 0 || y_values.length === 0) {
      return res.status(400).json({ error: 'Los arrays no pueden estar vacíos.' });
    }
    if (x_values.length !== y_values.length) {
      return res.status(400).json({ error: 'x_values y y_values deben tener la misma longitud.' });
    }

    const X = x_values.map(row => row.map(val => parseFloat(val)));
    const y = y_values.map(val => parseFloat(val));

    if (X.some(row => row.some(isNaN)) || y.some(isNaN)) {
      return res.status(400).json({ error: 'Todos los valores deben ser números válidos.' });
    }

    const { coefficients, rSquared } = solveLinearRegression(X, y);
    const terms = coefficients.map((coef, i) => `${i === 0 ? '' : '+ '}${coef.toFixed(4)}*X${i + 1}`).join(' ');
    const equation = `y = ${terms}`;

    res.json({ coefficients, rSquared, equation });
  } catch (err) {
    console.error('Error en regresión:', err);
    res.status(500).json({ error: 'Error interno al calcular la regresión.' });
  }
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  try {
    await poolConnect;
    console.log('✅ Conectado a SQL Server');
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  }
});