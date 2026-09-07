# Isle of Reveries Controller Not Working: PC Troubleshooting

Use the developer’s Steam Input workaround when the game does not recognize your controller. If native controller input already works, enabling a keyboard-emulation layout can instead produce simultaneous keyboard and controller actions.

## Choose the matching case

| Symptom | Developer guidance |
|---|---|
| No controller input | Try native input first; if it fails, use the Steam Input and community-layout steps below |
| A supported controller works but actions occur twice | Disable Steam Input to avoid simultaneous input paths |
| 8BitDo Ultimate 2C has incorrect mapping | The developer reports correct mapping in X-input mode with Steam Input disabled |
| Actions work but the displayed symbols are wrong | Change glyphs separately from bindings |

The 8BitDo advice is model-specific, not a universal promise for all third-party controllers. [Official thread and developer follow-ups](https://steamcommunity.com/app/3100970/discussions/0/583933098654383762/)

## Apply the unsupported-controller workaround

1. Enable Steam Input for Isle of Reveries.
2. Apply the community layout named **Keyboard to Gamepad**. It maps the default keyboard configuration to the pad.
3. Start the game and open Settings using the gear icon on File Select or the main Pause menu.
4. Select **ABXY** or **PlayStation** glyphs and confirm.

Changing glyphs changes the displayed symbols. It does not by itself prove the underlying button mapping is correct. Check menu access, movement and the assigned item action separately.

## If glyphs switch back to keyboard symbols

The developer posted a release-week update intended to fix that behaviour and suggested verifying game files if the update did not appear. Update before assuming an old report still describes your installation. The fix has not been independently tested for this guide.

## If the workaround still fails

The thread’s developer advice includes rebinding actions through the title-screen gamepad icon. Record the controller model, connection mode, Steam Input state and which actions fail before comparing your case with a report about a different device.

For Windows, the developer also notes that the game attempts to install Microsoft GameInput on first launch and links the official package as an alternative troubleshooting route. Use the link in the developer’s post; this guide does not provide an untested installer command or require changing Windows privileges.

This page concerns PC input, not console multiplayer setup. Once controls work, continue to [Pilgrim’s Sanctum puzzle help](03-pilgrims-sanctum.md).

Developer guidance checked September 7, 2026. Device compatibility and the update have not been independently tested for this guide.
