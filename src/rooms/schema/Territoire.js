const schema = require('@colyseus/schema');
const Schema = schema.Schema;

class Territoire extends Schema{
	constructor(nom,continent,proprietaire,voisins){
		super();
		this.nom = nom;
		this.proprietaire = proprietaire;
		this.continent = continent;
		this.army = 1;
		this.voisins = voisins;
	}
}
schema.defineTypes(Territoire, {
	nom: "string",
	proprietaire: "string",
	continent:"string",
	army:"number",
});
	
exports.Territoire = Territoire