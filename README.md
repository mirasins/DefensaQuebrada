# Comité de Defensa de la Quebrada de Ramón

Sitio estático en español con dos páginas:

- `index.html`: presentación de la causa y organización vecinal.
- `megaproyecto-la-reina/index.html`: antecedentes, propuesta vecinal, comparativo, cronología y fuentes.
- `assets/`: estilos, navegación, fotografía y PDF aportado.

## Subir a GitHub y publicar con GitHub Pages

1. Crea un repositorio en GitHub.
2. Descomprime este ZIP y sube su contenido a la raíz del repositorio. No subas únicamente el ZIP.
3. En **Settings → Pages**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/(root)`, luego guarda.
5. GitHub mostrará la URL cuando termine la publicación.

No requiere instalación, compilación ni claves. Las rutas relativas funcionan también cuando GitHub Pages publica en un subdirectorio con el nombre del repositorio. Conserva las carpetas y nombres de los archivos.

## Vista local

Abre `index.html` en un navegador, o ejecuta desde esta carpeta:

```bash
python -m http.server 8000
```

Visita http://localhost:8000.

## Contenido y fuentes

Antecedentes consultados el 9 de octubre de 2026. Los enlaces de fuentes aparecen en el sitio. Las observaciones vecinales están atribuidas a sus documentos; los antecedentes administrativos provienen del SEA y la BCN. En el documento aportado se conservan fechas de plantilla que no permiten confirmar su fecha de presentación.

Se incluyen tres fotografías y un video aportados para la ambientación, además de la referencia de la lámina 10 del documento original. El video ambiental está optimizado, sin sonido y se pausa con el control de animaciones. Las tipografías DM Sans y Libre Caslon Display se cargan desde Google Fonts; el sitio utiliza fuentes de respaldo si no hay conexión.

Este paquete contiene los archivos del sitio y el PDF, sin credenciales ni configuración del alojamiento privado de Sites.
