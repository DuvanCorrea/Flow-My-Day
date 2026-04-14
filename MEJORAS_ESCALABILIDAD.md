# Plan de Escalabilidad y Buenas Practicas

Fecha de inicio: 2026-04-13

Estados permitidos: Pendiente | En progreso | Bloqueado | Completado

## Diagnostico rapido

- La estructura actual es clara para un proyecto joven: comandos simples y una capa de almacenamiento unica.
- El mayor riesgo de crecimiento esta en la persistencia JSON sin estrategia de concurrencia/migraciones.
- La calidad base de pruebas es buena a nivel CLI, pero faltan pruebas unitarias por modulo para acelerar cambios grandes.
- La internacionalizacion ya existe y esta bien encaminada; falta automatizar validaciones de paridad de claves/placeholders.

## Backlog de mejoras

| ID | Area | Mejora propuesta | Impacto esperado | Primer entregable concreto | Estado | Prioridad |
|---|---|---|---|---|---|---|
| SC-001 | Arquitectura | Separar capa de casos de uso (Application) de la capa CLI (commands) | Menos acoplamiento y mas facilidad para agregar comandos/SDK/API | Crear src/application/useCases y mover logica de add/later/debt/done | Completado | Alta |
| SC-002 | Persistencia | Definir contrato de repositorio (TaskRepository) con adapters | Permite cambiar de JSON a SQLite sin romper comandos | Crear interfaz en src/domain y adapter JSON actual | Completado | Alta |
| SC-003 | Persistencia | Escrituras atomicas y lock de archivo para data.json | Evita corrupcion/perdida en ejecuciones concurrentes | Implementar write atomico (archivo temporal + rename) y lock simple | Pendiente | Alta |
| SC-004 | Persistencia | Versionado de schema y migraciones de datos | Evolucion segura del modelo en el tiempo | Agregar schemaVersion y carpeta src/storage/migrations | Pendiente | Alta |
| SC-005 | Escalabilidad | Adapter SQLite opcional para volumen mediano/alto | Mejor rendimiento en listados/filtros y menor riesgo de corrupcion | Adapter SQLite con mismas operaciones de dataStore | Pendiente | Media |
| SC-006 | Calidad | Estandar de tipado gradual (TypeScript o JSDoc + checkJs) | Menos bugs por tipos y refactors mas seguros | Activar checkJs o migrar utilidades criticas a TypeScript | Completado | Alta |
| SC-007 | Calidad | ESLint + Prettier + scripts de calidad | Codigo consistente y menor deuda tecnica | Agregar npm run lint, npm run format, npm run typecheck | Pendiente | Alta |
| SC-008 | Testing | Separar pruebas unitarias e integracion CLI | Feedback mas rapido y cobertura mas profunda | Crear test/unit para storage, i18n, helpText y npmClient | Pendiente | Alta |
| SC-009 | i18n | Test automatico de paridad en/es y placeholders | Evita regresiones de texto y errores de localizacion | Script que valide claves y placeholders en src/i18n/translations.ts | Pendiente | Alta |
| SC-010 | Observabilidad | Estandarizar codigos de salida y errores tipados | Integracion mas confiable en CI/scripts externos | Mapa de errores con codigos y util para reportarlos | Pendiente | Media |
| SC-011 | CI/CD | Pipeline CI (test, lint, typecheck, audit) | Prevencion temprana de regresiones | GitHub Actions con matriz Node LTS | Pendiente | Alta |
| SC-012 | Release | Automatizar versionado/changelog/publicacion | Entregas mas predecibles y trazables | Integrar Changesets o semantic-release | Pendiente | Media |
| SC-013 | Documentacion | Guia de arquitectura y contribucion | Onboarding mas rapido para nuevos colaboradores | Crear docs/architecture.md y CONTRIBUTING.md | Pendiente | Media |
| SC-014 | Seguridad | Escaneo de dependencias y politica de actualizacion | Menor riesgo por CVEs y dependencias desactualizadas | npm audit en CI + politica de actualizacion mensual | Pendiente | Media |

## Propuesta de fases

| Fase | Objetivo | Items sugeridos | Estado |
|---|---|---|---|
| Fase 1 (base) | Asegurar calidad y evolucion segura | SC-001, SC-002, SC-003, SC-004, SC-007, SC-008, SC-009, SC-011 | Pendiente |
| Fase 2 (escala) | Mejorar rendimiento y mantenibilidad | SC-005, SC-006, SC-010 | Pendiente |
| Fase 3 (operacion) | Madurez de release y colaboracion | SC-012, SC-013, SC-014 | Pendiente |

## Registro de avance

Actualiza esta tabla cada vez que se complete o inicie una mejora.

| Fecha | ID | Cambio de estado | Nota |
|---|---|---|---|
| 2026-04-13 | SC-000 | Completado | Se crea este tablero inicial de mejoras. |
| 2026-04-13 | SC-006 | Completado | Se activa TypeScript en modo gradual con checkJs + script typecheck. |
| 2026-04-13 | SC-006 | Completado | Se migra el modelo Activity a src/domain/activity.ts y se tipan sus usos en later/done/debt/dataStore. |
| 2026-04-13 | SC-006 | Completado | Se completa la migracion full TypeScript del proyecto (bin/src/test), con build a dist, tipado explicito en comandos/utilidades/storage y validacion verde en typecheck, test y help en en/es. |
| 2026-04-13 | SC-001 | Completado | Se crea la capa src/application/useCases y se mueve la logica de add/later/debt/done fuera de comandos, dejando la CLI como adaptador de entrada/salida. |
| 2026-04-13 | SC-002 | Completado | Se define el contrato ActivityRepository en dominio, se implementa el adapter JSON y se conecta la capa de comandos/use cases para depender del repositorio en lugar de dataStore directo. |
