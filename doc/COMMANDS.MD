# RAGS commands list

## CT_ACTION_ADD_CUSTOMCHOICE

This command lets you add a custom choice to an Action that takes custom input.  In order for an action to show up in the drop down list for Select Action, it must be marked as taking custom input obviously.  Finally, type in your new custom choice and it will show up the next time the player executes the action.

## CT_ACTION_CLEAR_CUSTOMCHOICE

This command lets you clear all custom choices in an Action that takes custom input.  In order for an action to show up in the drop down list for Select Action, it must be marked as taking custom input obviously.

## CT_ACTION_REMOVE_CUSTOMCHOICE

This command lets you remove a custom choice to an Action that takes custom input.  In order for an action to show up in the drop down list for Select Action, it must be marked as taking custom input obviously.  Finally, type in the custom choice you would like removed and it will not show up the next time the player executes the action.

## CT_DISPLAYCHARDESC

This command will display the selected character's description to the player.

## *CT_CHAR_DISPLAYPORT*

(TODO)

## CT_MOVECHAR

This command will move the selected character to the selected room.

## CT_MOVECHARINVTOPLAYER

This command will move the selected character's inventory to the player.  This will only move carryable, visible items.

## *CT_CHAR_MOVETOOBJ*

(TODO)

## *CT_CHAR_SETPORT*

(TODO)

## CT_SETCHARACTION

This command lets you activate or deactivate certain actions availabe on a character.  Select your character in the combo box, then select from their list of available actions and events.  You can enable and disable any event or action you'd like for the character.

## *CT_CHAR_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_CHAR_SET_CUSTOM_PROPERTY_JS*

(TODO)

## CT_SETCHARDESC

This command lets you change a character's description.  Select your character in the combo box, then type in their new description.

## *CT_CHAR_SET_GENDER*

(TODO)

## *CT_CHAR_SET_NAME*

(TODO)

## CT_COMMENT

This command does nothing except let the designer store comments in the game file.  This will let you remember what a complicated action does or what you have remaining to do in your game.

## CT_DEBUGTEXT

This command shows useful text messages in the player, but they will only show up when you are debugging your game.  During normal gameplay, these messages will not show up. In order to debug your game, simply choose "Debug Current Game" under the Tools menu.

## *CT_JAVA_SET_RAGS*

(TODO)

## CT_DISPLAYTEXT

This command will display text to the player.  You can of course use variable replacement codes and color codes to modify the display.  Use Alt-V to bring up a list of variable replacements when you return to the action control.

## CT_EXPORTVARIABLE

This command will let you save variable data for later importing into a new game or part 2 of a game so your players can carry their data through to the next game.  The user will be prompted with a save dialog so they can specify a filename and the variable will be exported to the file.

## CT_IMPORTVARIABLE

This command will let you load variable data into your game.  The user will be prompted with a load file dialog so they can specify a previously saved exported variable file from a previous game into the current game.

## CT_PAUSEGAME

This command will temporarily pause the game.  The click to continue button will be illuminated in the player.  Once the player clicks the button, the game will continue.  this is a good way to display a series of pictures in sequence during a command, or if you have a lot of text you'd like to display in chunks to the player.

## CT_DISPLAYLAYEREDPICTURE

This command lets you change the main picture's layered image viewed by the player.  Simply select the picture you'd like to display to the player.  This should typically be a transparent GIF that will display over the current main picture.

## CT_DISPLAYPICTURE

This command lets you change the main picture viewed by the player.  Simply select the picture you'd like to display to the player.

## *CT_MM_SET_BACKGROUND_MUSIC*

(TODO)

## *CT_MM_STOP_BACKGROUND_MUSIC*

(TODO)

## *CT_MM_PLAY_SOUNDEFFECT*

(TODO)

## *CT_MM_SET_MAIN_COMPASS*

(TODO)

## *CT_MM_SET_UD_COMPASS*

(TODO)

## *CT_LAYEREDIMAGE_ADD*

(TODO)

## *CT_LAYEREDIMAGE_CLEAR*

(TODO)

## *CT_LAYEREDIMAGE_REMOVE*

(TODO)

## *CT_LAYEREDIMAGE_REPLACE*

(TODO)

## CT_DISPLAYITEMDESC

This command lets you display an item's description.  Simply select the item from the combo box whose description you'd like displayed.

## CT_ITEM_LAYERED_REMOVE / CT_ITEM_LAYERED_WEAR

Layered Clothing is comprised of zones and levels.  A zone corresponds to a part of the body and the level is the order in which the clothing should be worn.  Level 1 is the closest to the skin, and level 10 would be the farthest from the skin.

RAGS preloads three body zones for you.  They are "Lower Body", "Mid Body", and "Upper Body".  You can add to these zones, say, a "Head" zone, or delete all the zones and create your own custom zones.

One piece of clothing may occupy more then one zone and level.  This is perfectly fine.  Just assign as many zones and levels as required.  Ex: Socks could be "Lower Body Level 1", Shoes could be "Lower Body Level 2", and say a dress could be "Upper Body Level 2 and Mid Body Level 2".

There are two commands that use the layered clothing scheme: *Item: Layered Wear* and *Item: Layered Remove*.  These commands enforce layered clothing limits.

Since clothing may or may not be worn after the command runs, you will need to check the status of the item and see if its worn, if you need to do additional commands after its successfully worn.

All text displays to the player are automatically handled by the command.  You no longer need to display text telling the player their item is worn or removed.

Here are the enforced rules by the layered clothes engine using our socks and shoes as an example.  Shoes(lvl 2) may be worn without Socks(lvl 1).  Socks(lvl 1) can not be worn if Shoes(lvl 2) are currently worn, or if another pair of Socks(lvl 1) are already worn.  Socks could not be removed if Shoes(lvl 2) are also already worn.  For Items that span multiple zones, the same rules apply, they are enforced at each level.

## CT_MOVEITEMTOCHAR

This command lets you move an item into a character's inventory.  Select the item you'd like to move, then select the character who will now be holding the item.

## CT_MOVEITEMTOINV

This command lets you move an item to the player's inventory.  You only need to select which item will be moved to the player's inventory.

## CT_MOVEITEMTOOBJ

This command will put an item inside an object.  First, select the object you'd like to move.  Next, select a container object that will hold the item.  Only items with the container property will show up in this final combo box.

## CT_MOVEITEMTOROOM

This command will move the selected object into the selected room.  First, select the object, then select the room you want the object to be moved to.

## CT_SETOBJECTACTION

This command lets you activate or deactivate certain actions availabe on an item/object.  Select your item in the combo box, then select from their list of available actions and events.  You can enable and disable any event or action you'd like for the selected item/object.

## *CT_ITEM_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_ITEM_SET_CUSTOM_PROPERTY_JS*

(TODO)

## CT_SETITEMDESC

This command lets you modify the description of an item/object.  First, select the item/object, then type in its new description.

## *CT_ITEM_SET_NAME_OVERRIDE*

(TODO)

## CT_SETLOCKEDUNLOCKED

This command lets you change the state of a lockable object.  First, select the lockable item from the combo box, then select its state: Locked or Unlocked.

## CT_SETOPENCLOSED

This command lets you change the state of an openable object.  First, select the openable item from the combo box, then select its state: Open or Closed.

## CT_SETITEMTOWORN

This command lets you change the state of a wearable object.  First, select the wearable item from the combo box, then select its state: Worn or Removed.

## CT_ITEM_SET_VISIBILITY

This command lets you change the visible state of an object.  First, select the item from the combo box, then select its state: Visible or Invisible. Invisible objects won't show up in any descriptions and can't be interacted with by the player.

## CT_ITEMS_MOVE_CONTAINER_TO_CONTAINER

This command lets you move all items from one container to another.  First, select the source container.  This container should currently have items in it.  Next, select the destination container.  This is the container that will receive all the items.

## CT_LOOP_BREAK

This command will exit the current loop condition if you are currently in a loop.  If you are not currently in a loop, this command is ignored.

## CT_CANCELMOVE

This command will stop a player from moving.  This command is typically used in the **\<\<on player enter\>\>** or **\<\<on player leave\>\>** events of a room, but could be used anywhere.  If a player is in the process of moving to another room, this command will cancel the move and the player will remain in their current room.

## *CT_DISPLAYPLAYERDESC*

(TODO)

## CT_SETLAYEREDPLAYERPORTRAIT

This command will change the player's layered portrait in the rags player.  Simply select the picture you'd like displayed in the portrait panel.  This should be a transparent GIF image that will lay over the portrait's background image.

## CT_MOVEINVENTORYTOCHAR

This command will move the players entire inventory to a selected character.

## CT_MOVEINVENTORYTOROOM

This command will move the player's entire inventory to the selected room.

## CT_MOVEPLAYER

This command will move the player to the selected room.

## *CT_MOVETOCHAR*

(TODO)

## *CT_MOVETOOBJ*

(TODO)

## *CT_PLAYER_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_PLAYER_SET_CUSTOM_PROPERTY_JS*

(TODO)

## *CT_SETPLAYERACTION*

(TODO)

## *CT_SETPLAYERDESC*

(TODO)

## CT_SETPLAYERGENDER

This command will change your player's gender.  This will affect certain text replacement triggers such as **[man/woman]** **[boy/girl]** or **[male/female]**.

## *CT_SETPLAYERNAME*

(TODO)

## CT_SETPLAYERPORTRAIT

This command will change the player's portrait in the rags player.  Simply select the picture you'd like displayed in the portrait panel.

## CT_DISPLAYROOMDESCRIPTION

This command will display the selected room's description.  You just need to choose which room's description should be displayed.

## CT_DISPLAYROOMPICTURE

This command will display the selected room's picture in the main picture display panel.  You just need to choose which room's picture should be displayed.

## CT_ROOM_MOVE_ITEMS_TO_PLAYER

This command will move items in the selected room to the player.  This will only move carryable, visible items.

## CT_SETROOMACTION

This command lets you activate or deactivate certain actions availabe on a room.  Select your room in the combo box, then select from their list of available actions and events.  You can enable and disable any event or action you'd like for the selected room.

## *CT_ROOM_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_ROOM_SET_CUSTOM_PROPERTY_JS*

(TODO)

## CT_SETROOMDESCRIPTION

This command will set the selected room's description.  You just need to choose which a room, then type in that room's new description.  Please note that this will NOT display the new description, merely change it.

## CT_SETEXIT

This command will let you activate or deactivate exits from the selected room.  First, select the room whose exits are to be modified.  Next, select from the available exits and choose whether the exit should be active or inactive.  once an exit is inactive, it will not show up on the navigation compass in the RAGS player's compass rose until it becomes active again.

## CT_SETEXITDESTINATION

This command will let you change the exit destination from the selected room.  First, select the room whose exits are to be modified.  Next, select the direction to change.  Finally, specify the new room to link to.  By default, these new destinations are active.

## *CT_ROOM_SET_NAME_OVERRIDE*

(TODO)

## CT_SETROOMLAYEREDPIC

This command will set the selected room's default layered picture.  You just need to choose which a room, then select the appropriate picture.  This should typically be a transparent GIF that will be imposed over the room's main picture.  Please note that this will NOT display the new picture, merely change it.

## CT_SETROOMPIC

This command will set the selected room's default picture.  You just need to choose which a room, then select the appropriate picture.  Please note that this will NOT display the new picture, merely change it.

## *CT_Status_ItemVisibleInvisible*

(TODO)

## CT_EXECUTETIMER

This command will immediately run the selected timer.  This command is the equivalent of a function call, immediately executing the **\<\<on each turn\>\>** event of the selected timer.  This is an excellent way of grouping commonly called commands and condition checks together so you're not copying the same commands and conditions throughout your game.

## CT_RESETTIMER

This command will immediately reset the turn count of the selected timer to 0.  This command has one extra powerful feature.  If you use this command within a timer and reset the currently running timer, the timer will immediately restart like a while loop.  This is a powerful way to loop through a large number of items and do a great deal of processing in your RAGS game.

## *CT_TIMER_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_TIMER_SET_CUSTOM_PROPERTY_JS*

(TODO)

## CT_SETTIMER

This command will turn a timer on or off.  Select the timer you'd like to change, and specify whether it should be active or inactive.

## CT_DISPLAYVARIABLE

This command will display the contents of a variable to the player.  You just need to select the variable whose contents will be displayed to the player.

## CT_SETVARIABLE

This command will set the contents of a variable.  Once you select the variable you'd like to modify, the options will change based on the variable type.  You will be able to add, subtract, add days, set text, etc... depending on the variable type you are manipulating.  You can also use variable replacements to set the contents of a variable ex. **[v: SomeVariable]**

## *CT_ITEM_GETRANDOMGROUP*

(TODO)

## *CT_MM_GETRANDOMGROUP*

(TODO)

## *CT_VARIABLE_SET_JAVASCRIPT*

(TODO)

## CT_SETVARIABLEBYINPUT

This command will set the contents of a text variable with the player's input.  You need to specify which type of input you will be receiving from the player.  You can choose objects, characters, objects and characters, inventory, custom, or text input just like at the action level.  The Player's reponse is stored in the selected text variable.  This can be used as a custom storage for a player's name so that it can be easily modifed later, or any other input data you'd like to track and be able to directly modify later in the game.

## *CT_SETVARIABLE_NUMERIC_BYINPUT*

(TODO)

## *CT_VARIABLE_SET_CUSTOM_PROPERTY*

(TODO)

## *CT_VARIABLE_SET_CUSTOM_PROPERTY_JS*

(TODO)

## CT_VARIABLE_SET_RANDOMLY

This command will set the contents of a numeric variable randomly.  In order to set the variable randomly, the numeric variable must have its enforce limits turned on.  The min and max limits are what RAGS uses to randomize the value.

## *CT_VARIABLE_SET_WITH_CHARPROPERTYVALUE*

(TODO)

## *CT_VARIABLE_SET_WITH_ITEMPROPERTYVALUE*

(TODO)

## *CT_VARIABLE_SET_WITH_PLAYERPROPERTYVALUE*

(TODO)

## *CT_VARIABLE_SET_WITH_ROOMPROPERTYVALUE*

(TODO)

## *CT_VARIABLE_SET_WITH_TIMERPROPERTYVALUE*

(TODO)

## CT_VARIABLE_SET_WITH_VARIABLE

This command will set the contents of a variable with the value of another variable.  Once you select the variable you'd like to modify, the options will change based on the variable type.  You will be able to add, subtract, add days, set text, etc... depending on the variable type you are manipulating.

## *CT_VARIABLE_SET_WITH_VARIABLEPROPERTYVALUE*

(TODO)

## CT_ENDGAME

This command will end the game.  You can enter text that will display to the player and explain why the game has ended.
