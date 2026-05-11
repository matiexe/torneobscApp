# Guía de Configuración y Despliegue: Súper Liga BSC

Este documento detalla los pasos finales para poner en marcha la aplicación utilizando Supabase y Vercel.

## 1. Configuración de Supabase
1. **Crear Proyecto**: Inicia sesión en [supabase.com](https://supabase.com/) y crea un nuevo proyecto llamado `TorneoBSC`.
2. **Base de Datos**: 
   - Ve a la sección **SQL Editor**.
   - Copia el contenido del archivo local `supabase_schema.sql`.
   - Pégalo en una nueva consulta y haz clic en **Run**.
   - Esto creará las tablas `teams` y `matches`, e insertará los datos iniciales del fixture.

## 2. Variables de Entorno
En la configuración de tu proyecto en Supabase (**Settings > API**), obtén las siguientes llaves y actualiza tu archivo `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: La URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La llave pública (anon public).
- `SUPABASE_SERVICE_ROLE_KEY`: La llave de servicio (service_role).

## 3. Ejecución Local
```bash
cd torneo-bsc
npm install
npm run dev
```
Accede a `http://localhost:3000` para ver la aplicación y a `http://localhost:3000/admin` para gestionar resultados.

## 4. Despliegue en Vercel
1. Sube el código a un repositorio de GitHub.
2. Importa el proyecto en Vercel.
3. **Crucial**: Agrega las 3 variables de entorno mencionadas anteriormente en la configuración de Vercel antes de desplegar.
4. Vercel detectará automáticamente que es un proyecto de Next.js y realizará el build.

## 5. Panel de Administración
- La ruta `/admin` permite cargar resultados.
- Una vez cargado un resultado, la tabla de posiciones se actualizará automáticamente en la página principal.
- Puedes generar la imagen para redes sociales desde el botón correspondiente en el panel.
