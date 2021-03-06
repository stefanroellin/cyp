import * as html from "../html.js";
import * as art from "../art.js";
import Item from "../item.js";


const ICONS = {
	"AlbumArtist": "artist",
	"Album": "album",
	"Genre": "music"
}

export default class Tag extends Item {
	constructor(type, value, filter) {
		super();
		this._type = type;
		this._value = value;
		this._filter = filter;
	}

	connectedCallback() {
		html.node("span", {className:"art"}, "", this);
		this._buildTitle(this._value);
	}

	createChildFilter() {
		return Object.assign({[this._type]:this._value}, this._filter);
	}

	async fillArt(mpd) {
		const parent = this.firstChild;
		const filter = this.createChildFilter();

		let artist = filter["AlbumArtist"];
		let album = filter["Album"];
		let src = null;

		if (artist && album) {
			src = await art.get(mpd, artist, album);
			if (!src) {
				let songs = await mpd.listSongs(filter, [0,1]);
				if (songs.length) {
					src = await art.get(mpd, artist, album, songs[0]["file"]);
				}
			}
		}

		if (src) {
			html.node("img", {src}, "", parent);
		} else {
			const icon = ICONS[this._type];
			html.icon(icon, parent);
		}
	}
}

customElements.define("cyp-tag", Tag);
