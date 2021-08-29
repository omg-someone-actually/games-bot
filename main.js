const { Client, Intents,  MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });
const fs = require('fs');

function getzombieUsers(){
	const data = fs.readFileSync('zombiehunter.json', 'utf8');
    const zombieUsers = JSON.parse(data);

	return zombieUsers
}

const zombieUsers = getzombieUsers();

function randint(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

function choice(list){
	return list[Math.floor(Math.random() * list.length)];
}

class Gun {
	constructor(damage, shotsToShootMin, shotsToShootMax){
		this.damage = damage;
		this.shotsToShootMin = shotsToShootMin;
		this.shotsToShootMax = shotsToShootMax;
	}
}



function savezombieUsers(){
	const data = JSON.stringify(zombieUsers);

	fs.writeFile('zombiehunter.json', data, 'utf8', (err) => {
});
}

function getUser(user){
	
	const data = fs.readFileSync('zombiehunter.json', 'utf8');
    const zombieUsers_data = JSON.parse(data);
	if (!zombieUsers[user]){
		zombieUsers[user] = {};
		zombieUsers[user]['avatarColor'] = "Not selected"
		zombieUsers[user]['weapons'] = "Not selected"
		zombieUsers[user]['level'] = 1
		savezombieUsers();
	}
	return zombieUsers_data[user];
}

    

const pistol = new Gun(45, 2, 4);
const grenade = new Gun(80, 1, 2);
const lmg = new Gun(30, 2, 5);
const smg = new Gun(15, 3, 12);
const rifle = new Gun(25, 2, 7);
const rocketLauncher = new Gun(70, 1, 2);
const tank = new Gun(80, 1, 2);
const sword = new Gun(60, 1, 2);
const knife = new Gun(30, 3, 6);
const shotGun = new Gun(65, 1, 2);

const colors = ['blue', 'red', 'black', 'white', 'orange', 'yellow', 'purple', 'grey', 'green']
const guns = {'pistol': pistol, 'grenade': grenade, 'lmg': lmg, 'smg': smg, 'rifle': rifle, 'rocket launcher': rocketLauncher, 'tank': tank, 'sword': sword, 'knife': knife, 'shotgun': shotGun}
const commandsInfo = {'setup': 'Setup your character', 'loadout': 'See your loadout', 'battle': 'Battle against a enemy.', 'coinflip': 'Toss a coin', 'snake': 'Play classic snake'}
let commands = []
const zombieHealth = 100

function invalidCoordinates(playersCoordinates, newPosition){
	if (newPosition.some(coordinate => coordinate == 0) || newPosition.some(coordinate => coordinate == 8)){
		return true;
	}
	return false;
}

function fightZombie(interaction){
	userWeapons = getUser(interaction.user.id)['weapons']
	selectedWeapon = choice(userWeapons)
	weapon = guns[selectedWeapon]
	shotsShooted = randint(weapon.shotsToShootMin, weapon.shotsToShootMax)
	total_damage = shotsShooted * weapon.damage
	return [total_damage, shotsShooted, weapon.damage]

}

bot.on("ready", async () => {
   // await bot.guilds.cache.get('844260492826378240').commands.set([]);
   // if (!bot.application?.owner) bot.application?.fetch();

	for (const [commandName, commandDescription] of Object.entries(commandsInfo)){
        commands.push(
			{
				name: commandName,
				description: commandDescription
			}
		)
    }

   // bot.guilds.cache.get('844260492826378240')?.commands.set(commands)
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;
	const availableMoves = ['up', 'down', 'left', 'right']
	const id = interaction.customId
	if(id == 'reset'){
		let emojiString = ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:\n";
			for (collumn in [1, 2, 3, 4, 5, 6, 7]){
				emojiString += ":black_large_square:"
				for (row in [1, 2, 3, 4, 5, 6, 7]){
					if (row * collumn == 9){
						emojiString += ":flushed:";
					}
					else {
						emojiString += ":blue_square:";
					}
					
				}
				emojiString += ":black_large_square:"
				emojiString += "\n"

			}

			emojiString += ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:";
			await interaction.update(emojiString)
	}
	if (availableMoves.some(item => item === id)){
		let playersCoordinates = [0, 0];
		let row = 0;
		let collumn = 1;
		const emojiRegex = /(:[^:]*:)/g
		const emojisFound = interaction.message.content.match(emojiRegex)
		for (let emoji of emojisFound){
			if (emoji != ':black_large_square:'){
					row ++;
				if (row == 8){
					row = 1;
					collumn ++;
				}
				if (emoji == ":flushed:"){
					playersCoordinates = [row, collumn];
					
				}
				
			}
			
		}

		let emojiString = ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:\n";
		const moveOptions = {'up': [playersCoordinates[0], playersCoordinates[1] -1], 'down': [playersCoordinates[0], playersCoordinates[1] +1], 'left': [playersCoordinates[0] -1, playersCoordinates[1]], 'right': [playersCoordinates[0] +1, playersCoordinates[1]]};
		const newPosition = moveOptions[interaction.customId];
		const moves = [1, 2, 3, 4, 5, 6, 7];
		let currentCoordinates;
		if (!invalidCoordinates(playersCoordinates, newPosition)){
			for (let newCollumn of moves){
				emojiString += ":black_large_square:"
				for (let newRow of moves){
					currentCoordinates = [newRow, newCollumn]
					if (currentCoordinates[0] == newPosition[0] && currentCoordinates[1] == newPosition[1]){
						emojiString += ":flushed:";
					}
					else {
						emojiString += ":blue_square:";
					}
					
				}
				emojiString += ":black_large_square:"
				emojiString += "\n"
	
			}	
		}
		else if (invalidCoordinates(playersCoordinates, newPosition)){
			for (let newCollumn of moves){
				emojiString += ":black_large_square:"
				for (let newRow of moves){
					currentCoordinates = [newRow, newCollumn]
					if (currentCoordinates[0] == playersCoordinates[0] && currentCoordinates[1] == playersCoordinates[1]){
						emojiString += ":flushed:";
					}
					else {
						emojiString += ":blue_square:";
					}
					
				}
				emojiString += ":black_large_square:"
				emojiString += "\n"
	
			}
		}
		emojiString += ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:";

		
		

		await interaction.update(emojiString)
	}

	if (guns[interaction.customId] != null){
		let gunInfo = fightZombie(interaction);
		if (gunInfo[0] >= zombieHealth){
			await interaction.update({ content: `You killed the zombie with a ${interaction.customId}. Dealing a total damage of ${gunInfo[0]} with ${gunInfo[1]} bullets. `, components: [] });
			zombieUsers[interaction.user.id]['level']++;
			savezombieUsers();
			await interaction.channel.send({content: `You have leveled up to ${zombieUsers[interaction.user.id]['level']}!`, ephemeral: true})
			return
		}
		await interaction.update({ content: `You failed to kill the zombie, it killed you. You shot ${gunInfo[1]} bullets and dealed ${gunInfo[0]} damage.`, components: [] });
		
	}
	if (interaction.customId == "fight"){
		userWeapons = getUser(interaction.user.id)['weapons']
		userWeapons
		const row = new MessageActionRow();
		userWeapons.forEach(weapon => {
			row.addComponents(
				new MessageButton()
					.setCustomId(weapon)
					.setLabel(weapon)
					.setStyle('SUCCESS'),
			);
		})
		await interaction.update({ content: 'What weapon do you want to use?', components: [row] });
	}
	else if (interaction.customId == "flee"){
		await interaction.update({ content: 'You decided to flee! Neither of you are dead.', components: [] });
	}
	savezombieUsers();
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isSelectMenu()) return;
	user = interaction.user.id
	getUser(user)

	if (interaction.customId === 'colors') {
		await interaction.reply({ content: `Your avatar is now: ${interaction.values}`, ephemeral: true, components: [] });
		zombieUsers[user]['avatarColor'] = interaction.values
		savezombieUsers();
	}
	if (interaction.customId === 'weapons') {
		await interaction.reply({ content: `Your weapon is now: ${interaction.values}`, ephemeral: true, components: [] });
		zombieUsers[user]['weapons'] = interaction.values
		savezombieUsers();
	}
});

bot.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	user = interaction.user.id
	getUser(user)

	if (interaction.commandName == "snake"){
		const row1Buttons = {' ': 'placeHolder1', 'Up': 'up', '  ': 'placeHolder2'}
		var row1 = new MessageActionRow()
		for (const [buttonLabel, buttonID] of Object.entries(row1Buttons)){
			if (buttonLabel == "Up"){
				row1.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('SUCCESS')
				)
			}
			else {
				row1.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('SECONDARY')
						.setDisabled(true)
				)
			}
			
		}
		
		const row2Buttons = {'Left': 'left', 'Reset': 'reset', 'Right': 'right'}
		var row2 = new MessageActionRow()
		for (const [buttonLabel, buttonID] of Object.entries(row2Buttons)){
			if (buttonLabel == 'Reset'){
				row2.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('PRIMARY')
				)
			}
			else{
				row2.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('SUCCESS')
				)
			}
			
		}
			
		

		const row3Buttons = {' ': 'placeHolder4', 'Down': 'down', '  ': 'placeholder5'}
		var row3 = new MessageActionRow()
		for (const [buttonLabel, buttonID] of Object.entries(row3Buttons)){
			if (buttonLabel == "Down"){
				row3.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('SUCCESS')
				)
			}
			else {
				row3.addComponents(
					new MessageButton()
						.setCustomId(buttonID)
						.setLabel(buttonLabel)
						.setStyle('SECONDARY')
						.setDisabled(true)
				)
			}
			
		}

			let emojiString = ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:\n";
			for (collumn in [1, 2, 3, 4, 5, 6, 7]){
				emojiString += ":black_large_square:"
				for (row in [1, 2, 3, 4, 5, 6, 7]){
					if (row * collumn == 9){
						emojiString += ":flushed:";
					}
					else {
						emojiString += ":blue_square:";
					}
					
				}
				emojiString += ":black_large_square:"
				emojiString += "\n"

			}

			emojiString += ":black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square::black_large_square:";


			await interaction.reply({content: emojiString, components: [row1, row2, row3]})
	}

	if (interaction.commandName == "coinflip"){
		const roll = randint(1, 2)
		if (roll == 1)
        {
			const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Heads!')
			.setImage('https://www.photos-public-domain.com/wp-content/uploads/2012/09/us-quarter-dollar-coin-front.jpg')
			.setTimestamp()
            interaction.reply({embeds: [embed]});
        }
	
        else 
        {
			const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Tails!')
			.setImage('https://images-na.ssl-images-amazon.com/images/I/51NyMaKLydL.jpg')
			.setTimestamp()
            interaction.reply({embeds: [embed]});
        }
	}

	if (interaction.commandName == "battle"){
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('fight')
					.setLabel('Fight')
					.setStyle('PRIMARY'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('flee')
					.setLabel('Flee')
					.setStyle('DANGER'),
			);

		await interaction.reply({ content: 'You stumble into a zombie! What do you do?', components: [row] });
	}

	if (interaction.commandName == "loadout"){
		await interaction.reply({ content: `Avatar: ${getUser(user)['avatarColor']}\nWeapons: ${getUser(user)['weapons']}`, components: [] });
	}

	if (interaction.commandName === 'setup') {
		let colorSet = [];
		let gunSet = [];
		colors.forEach(color => {
			colorSet.push({
				label: color,
				description: `Choose this to have a ${color} avatar!`,
				value: color,
			})
		})

		for (const [gun, gunObject] of Object.entries(guns)) {
			gunSet.push({
					label: gun,
					description: `Choose this to have ${gun} as a weapon!`,
					value: gun,
			})
		}
		const color_componet = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('colors')
					.setPlaceholder('Avatar color')
					.addOptions(colorSet),
			);
		const weapon_componet = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('weapons')
					.setPlaceholder('Weapon')
					.addOptions(gunSet),
			);

		await interaction.reply({ content: 'Choose your setup.', components: [color_componet, weapon_componet] });
	}
	savezombieUsers();
});


var letters = ["\U0001f1e6", "\U0001f1e7", "\U0001f1e8", "\U0001f1e9", "\U0001f1ea", "\U0001f1eb", "\U0001f1ec", "\U0001f1ed", "\U0001f1ee", "\U0001f1ef", "\U0001f1f0", "\U0001f1f1", "\U0001f1f2", "\U0001f1f3", "\U0001f1f4", "\U0001f1f5", "\U0001f1f6", "\U0001f1f7", "\U0001f1f8", "\U0001f1f9", "\U0001f1fa", "\U0001f1fb", "\U0001f1fc", "\U0001f1fd", "\U0001f1fe", "\U0001f1ff"];
var unicode = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

var games = [];

var stages = [`\`\`\`
/---|
|   
|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|   |
| 
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|\\
|
|
\`\`\`
`, `\`\`\`
/---|
|   o
|  /|\\
|  /
|
\`\`\`
`, `\`\`\`
/---|
|   o 
|  /|\\
|  / \\
|
\`\`\`
`];

function generateMessage(phrase, guesses) {
	var s = "";
	for(var i = 0; i < phrase.length; i++) {
		if(phrase[i] == ' ')
			s += " ";
		else {
			var c = phrase[i];
			if(guesses.indexOf(c) == -1)
				c = "\\_";
			s += "__" + c + "__ ";
		}
	}
	return s;
}

function nextLetter(message, index, word) {
    message.react(letters[index]).then(r => {
		index++;
		if(index < letters.length) {
			if(index == 13) {
				message.channel.send(generateMessage(word, [])).then(m => {
					games.push({
						stage: 0,
						msg0: message,
						msg1: m,
						phrase: word,
						guesses: []
					});
					nextLetter(m, index);
				});
			} else {
				nextLetter(message, index, word);
			}
		}
	});
}

bot.on('messageReactionAdd', (reaction, user) => {
	var msg = reaction.message;
	if(!user.bot) {
		for(var i = 0; i < games.length; i++) {
			var game = games[i];
			if((msg.id == game.msg0.id || msg.id == game.msg1.id) && game.stage < stages.length) {
				var letter = unicode[letters.indexOf(reaction.emoji.name)];
				
			 reaction.users.fetch().then(usrs => {
					var reactors = usrs;
					var remove_next = function(index) {
						if(index < reactors.length)
							reaction.remove(reactors[index]).then(() => remove_next(index + 1));
					};
					
					remove_next(0);
				});
				
				if(game.guesses.indexOf(letter) == -1) {
					game.guesses.push(letter);
					if(game.phrase.indexOf(letter) == -1) {
						game.stage ++;
						game.msg0.edit(stages[game.stage]);
					} else {
						var sik = true;
						for(var j = 0; j < game.phrase.length; j++) {
							var c = game.phrase[j];
							if(c != ' ' && game.guesses.indexOf(c) == -1) {
								sik = false;
							}
						}
						game.msg1.edit(generateMessage(game.phrase, game.guesses));
					}
				}
			}
			games[i] = game;
		}
	}
});

bot.on('messageCreate', msg => {
    if(msg.content.startsWith(`!hangman`)) {
        	var words = msg.content.split('\n')[0].split(' ');
			var word = words.slice(1).join(' ').toLowerCase().replace(/[^a-z\s:]/g, '');
			msg.channel.send(stages[0]).then(m => {
				nextLetter(m, 0, word);
			});
        }
});


bot.login("bot token");
