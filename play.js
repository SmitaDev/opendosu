const { Util, DiscordAPIError } = require("discord.js");
const discord = require('discord.js')
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");


exports.run = async (client, message, args) => {
    const { channel } = message.member.voice;
    const sorry = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription('<:redTick:755369523074301991> I am sorry but you need to be in a voice channel to play music!')
      const sorry2 = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription('<:redTick:755369523074301991> I cannot connect to your voice channel, make sure I have the proper permissions!')
      const sorry3 = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription('<:redTick:755369523074301991> I cannot speak in this voice channel, make sure I have the proper permissions!')
      const sorry4 = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription('<:redTick:755369523074301991> You did not poivide want i want to play')
    if (!channel)
      return message.channel.send(sorry);
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(sorry2);
    if (!permissions.has("SPEAK"))
      return message.channel.send(sorry3);
    const youtube = new YouTube(client.config.api);
    var searchString = args.join(" ");
    if (!searchString)
      return message.channel.send(sorry4);
    const serverQueue = message.client.queue.get(message.guild.id);
    var videos = await youtube.searchVideos(searchString).catch(console.log);
    var songInfo = await videos[0].fetch().catch(console.log);

    const song = {
      id: songInfo.video_id,
      title: Util.escapeMarkdown(songInfo.title),
      url: songInfo.url,
    };
    const right = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription(`<a:5845_tickgreen:755367931130675291> **${song.title}** has been added to the queue!`)

    if (serverQueue) {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      return message.channel.send(right);
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 2,
      playing: true,
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      if (!song) {
        queue.voiceChannel.leave();
        message.client.queue.delete(message.guild.id);
        return;
      }
      const rightg = new discord.MessageEmbed()
      .setColor('#ff2f7d')
      .setAuthor(`Play Command`)
      .setThumbnail('https://i.giphy.com/media/Z4ITmGFsXV19C/200w.webp')
      .setDescription(`<a:Music:755409091135799377> Started Playing : **${song.title}**`)
      const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          queue.songs.shift();
          play(queue.songs[0]);
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queue.volume / 5);
      queue.textChannel.send(rightg);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(
        `I could not join the voice channel: ${error}`
      );
    }
};
