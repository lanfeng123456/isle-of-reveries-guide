# Isle of Reveries Copy and Spawn: Limits, Direction and Puzzle Uses

The fairy lets you copy an object and create it elsewhere. The in-game tutorial limits you to one stored/created object at a time. Solve the missing interaction in front of you rather than planning a room around several simultaneous copies.

## Learn the basic sequence

Face the object you want to copy, use the copy action, move to the required position and create the object there. The first fairy-room example uses a square block and an empty pressure plate. The created block holds the plate so Lief can leave. [Developer tutorial](https://www.youtube.com/watch?v=VtYJbNxOTlI&t=380s) · [Independent tutorial and result](https://www.youtube.com/watch?v=xDWKhkQXONI&t=1660s)

Do not generalize a button label from one video: the two recordings use different input prompts.

## Identify what the room is asking for

| Room feature | Verified application | Check before retrying |
|---|---|---|
| Empty pressure plate | Create a block on it | Is the block actually on the plate? |
| Missing coloured statue | Supply the corresponding statue | Is it on the matching base? |
| Unreachable brazier | Send a shooter’s arrow through an existing flame | Are shooter, flame and target aligned? |
| Eye statue puzzle | Copy with the correct source orientation | Which direction was the eye facing when copied? |

The first three applications have concrete examples in [Pilgrim’s Sanctum](03-pilgrims-sanctum.md). For the last, the developer specifically confirms that the eye’s direction at copying time matters; the answer does not give one compass direction that solves every room. [Developer clarification](https://steamcommunity.com/app/3100970/discussions/0/583933098654442513/#c583933098654443350)

## Diagnose a failed copy puzzle

First check the selected source, then its orientation, then the destination. Changing all three at once makes it harder to tell which part was wrong. This is a troubleshooting method, not a claim that every object in the game can be copied.

For fire puzzles, draw an imaginary straight line from the shooter through the lit brazier to the unlit one. A nearby flame is not enough if it is outside the arrow’s path. See [Fermata](04-fermata.md) for the vertical version of that interaction.

Sources: developer tutorial, community gameplay and a developer reply. Controls depend on your bindings; no exhaustive copyable-object list is provided.
