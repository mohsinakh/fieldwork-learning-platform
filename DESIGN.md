# Fieldwork design

The interface uses the Swiss anchor from the user-selected [frontend-design skill](https://github.com/Ilm-Alan/frontend-design/blob/main/SKILL.md). The guide and interface copy follow the humanizer skill, using direct instructions and examples without repeated summary lines.

## Layout

The home page has one guide and today's study tasks. Files appear in the relevant guide chapters. There is no separate library or catalog of guides that have not been added.

Large chapter numbers connect the overview and reader. Counts come from the guide data. Desktop readers get a sticky contents list; smaller screens use a chapter selector. The study plan and application tracker use the same grid and form styles.

## Tokens

| Role | Value |
| --- | --- |
| Main surface | `#FFFFFF` |
| Secondary surface | `#F7F7F8` |
| Accent | `#002FA7` |
| Main text | `#171719` |
| Secondary text | `#68686F` |
| Rules | `#DFDFE3`, 1 px |
| Typography | Helvetica Neue, with Helvetica and generic sans-serif fallbacks |

The PDF uses Helvetica and the same colors. Counts show saved user activity; empty records stay empty.

## Storage

User state uses browser `localStorage`. The site reads its guide and attachment manifest from static JSON files. It makes no requests to an application backend.
