export const TEMPLATE_NAME = 'Template pronto per importazione';

export const CREATURE_TEMPLATE_GUIDE = `[NOME CREATURA] - Creatura [LIVELLO]

[ALLINEAMENTO/ETICA] [TAGLIA] [TRATTO 1] ([TRATTO 2], [TRATTO 3], ...)
[RARITA se presente]

Percezione +[BONUS] [; senso speciale 1] [; senso speciale 2]
Lingue [lingua 1], [lingua 2], [lingua 3] [; telepatia X m] [; altre comunicazioni]
Abilita [Skill 1] +[BONUS], [Skill 2] +[BONUS], [Lore X] +[BONUS]
For +[MOD] Des +[MOD] Cos +[MOD] Int +[MOD] Sag +[MOD] Car +[MOD]
Oggetti [oggetto 1], [oggetto 2], [oggetto 3]

CA [VALORE] [; con scudo alzato [VALORE]]
Tempra +[BONUS] Riflessi +[BONUS] Volonta +[BONUS]
PF [VALORE] [; Immunita ...] [; Debolezze ...] [; Resistenze ...]
[Eventuali difese automatiche, rigenerazione, fast healing, reattivita difensiva]

Velocita [X] m [; scalare X m] [; nuotare X m] [; volare X m] [; scavare X m]

Melee ? [ATTACCO 1] +[BONUS] ([tratti]), Danni [formula + tipo] [piu effetto]
Melee ? [ATTACCO 2] +[BONUS] ([tratti]), Danni [formula + tipo] [piu effetto]
Ranged ? [ATTACCO 3] +[BONUS] ([tratti], gittata [X] m), Danni [formula + tipo] [piu effetto]

[Spazio per capacita automatiche/offensive senza azioni]
[CAPACITA PASSIVA 1] ([tratti]) [testo]
[CAPACITA PASSIVA 2] ([tratti]) [testo]

AZIONI
[Azione 1] ? ([tratti]); Frequenza ...; Requisiti ...; Effetto ...
[Azione 2] ?? ([tratti]); Tiro salvezza ...; Effetto ...

REAZIONI
[Reazione 1] [reaction] ([tratti]); Trigger ...; Requisiti ...; Effetto ...

AZIONI GRATUITE
[Azione gratuita 1] [free-action] ([tratti]); Trigger ...; Effetto ...

INCANTESIMI / MAGIA
Incantesimi Innati [tradizione] CD [X], attacco +[X]
Costanti - [incantesimo], [incantesimo]
A volonta - [incantesimo], [incantesimo]
[X]/giorno - [incantesimo], [incantesimo]

NOTE / PARSER HINTS
Fonte: [manuale / homebrew / NPC / boss / hazard-like creature]
Ruolo: [brute / skirmisher / caster / controller / soldier / support]
Famiglia: [undead, demon, guardia, animale, ecc.]
Template applicati: [elite, weak, custom, mythic, ecc.]
Campi mancanti confermati: [es. "Lingue sconosciute", "Oggetti non rilevanti"]`;

export const CREATURE_TEMPLATE_EXAMPLE = `Sentinella delle Catacombe - Creatura 5

NM Medio Non Morto (Guardia, Incorporeo, Ombra)
Non Comune

Percezione +13; scurovisione; percezione del vivente 9 m
Lingue Comune, Necril; telepatia 18 m
Abilita Furtivita +15, Intimidation +12, Religion +10, Lore Catacombe +11
For - Des +4 Cos - Int +1 Sag +2 Car +3
Oggetti -

CA 22
Tempra +11 Riflessi +15 Volonta +13
PF 82; Immunita malattia, veleno, paralizzato, precisione; Debolezze forza 5; Resistenze tutti i danni 5 (eccetto forza, positivo, attacchi fantasma)
Rigenerazione d'Ombra La sentinella recupera 5 PF all'inizio del suo turno se si trova in luce fioca o oscurita; non recupera PF nel round successivo a quello in cui ha subito danni da forza o positivi.

Velocita 0 m; volare 9 m

Melee ? artiglio spettrale +15 (agile, finesse, magico), Danni 2d6+6 negativi piu affievolimento dell'ombra
Melee ? tocco gelido +15 (finesse, magico), Danni 2d8+6 freddo piu 1d4 danni persistenti da freddo
Ranged ? scheggia d'ombra +14 (magico, gittata 18 m), Danni 2d6+5 negativi

Aura di Gelo Sepolcrale (aura, freddo, necromanzia) 3 m. Una creatura vivente che entra nell'aura o vi inizia il turno deve superare un TS Tempra CD 21 oppure subire 1d6 danni da freddo; in caso di fallimento critico e anche rallentata 1 fino all'inizio del suo prossimo turno.
Affievolimento dell'Ombra (necromanzia) Una creatura colpita dall'artiglio spettrale deve superare un TS Tempra CD 21 oppure diventa impreparata fino all'inizio del suo prossimo turno.

AZIONI
Balzo tra le Ombre ? (concentrazione, occulto, teletrasporto); Requisiti La sentinella si trova in luce fioca o oscurita; Effetto Si teletrasporta fino a 9 m in uno spazio in luce fioca o oscurita che puo vedere.

Lamento delle Cripte ?? (auditivo, emozione, mentale, paura); Frequenza 1/10 minuti; Area cono di 9 m; Tiro salvezza Volonta CD 21; Effetto Le creature nell'area subiscono 4d6 danni mentali.
Successo Critico La creatura non subisce effetti.
Successo La creatura subisce meta danni.
Fallimento La creatura subisce danni pieni ed e spaventata 1.
Fallimento Critico La creatura subisce danni doppi ed e spaventata 2.

Avvolgere nell'Ombra ?? (oscurita, necromanzia); Bersaglio 1 creatura entro 9 m; Tiro salvezza Riflessi CD 21; Effetto Ombre serrate avvolgono il bersaglio.
Successo Critico Nessun effetto.
Successo Il bersaglio subisce una penalita di status -1 alla velocita fino all'inizio del turno della sentinella.
Fallimento Il bersaglio e immobilizzato fino alla fine del suo prossimo turno.
Fallimento Critico Il bersaglio e immobilizzato e impreparato fino alla fine del suo prossimo turno.

REAZIONI
Scarto Spettrale [reaction] (occulto, teletrasporto); Trigger Una creatura manca la sentinella con un attacco in mischia; Effetto La sentinella si sposta volando di 3 m senza provocare reazioni.

Riflesso delle Tombe [reaction] (freddo); Trigger Una creatura entro 3 m colpisce la sentinella con un attacco in mischia; Effetto La creatura che ha colpito subisce 1d6 danni da freddo.

AZIONI GRATUITE
Forma Evanescente [free-action] (concentrazione); Trigger La sentinella tira iniziativa; Effetto Ottiene un bonus di status +2 alla propria prima prova di Furtivita o al primo tentativo di Nascondersi effettuato nel combattimento.

Sibilo Sepolcrale [free-action] (auditivo, paura); Effetto Una creatura spaventata entro 9 m che la sentinella puo percepire subisce una penalita -1 ai TS contro il prossimo Lamento delle Cripte della sentinella entro la fine del turno successivo della sentinella.

INCANTESIMI / MAGIA
Incantesimi Innati Occulti CD 21, attacco +13
Costanti - individuazione del magico
A volonta - mano del mago, suono fantasma
1/giorno - oscurita

NOTE / PARSER HINTS
Fonte: homebrew
Ruolo: skirmisher / controller
Famiglia: undead
Template applicati: custom
Campi mancanti confermati: Oggetti non rilevanti, For e Cos non applicabili in modo tradizionale`;
