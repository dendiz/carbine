Zombie = function(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.radius = 20;
	this.health = 100;
	this.max_vel = 0.3; //maximum velocity;
	this.vel = 0.2 + Math.random() * this.max_vel; //velocity
	this.direction = Math.atan2(C.player.x-this.x, C.player.y-this.y);
	this.sprite = null;
	this.bloody = Math.random(); //draws more blood when shot
	this.blood_phi = Math.random() * 2 * Math.PI; //angle of the blood sprite
	this.damage = 2;
	this.killpause = false;
}
Zombie.prototype.detect_zombie_collision = function() {
	var dir = Math.atan2(C.player.x-this.x, C.player.y-this.y);
	var prev_direction = this.direction; //cache the current direction
	this.direction = dir;
	for (var j=0,len=C.zombies.length;j<len;j++){
		var z = C.zombies[j];
		if (z.id == this.id) continue;
		if (Util.detect_collision(z.x,z.y,z.radius,this.x,this.y,this.radius)) {
			var dx1 = this.x - C.player.x;
			var dy1 = this.y - C.player.y;
			var d1 = dx1*dx1 + dy1*dy1;

			var dx2 = z.x - C.player.x;
			var dy2 = z.y - C.player.y;
			var d2 = dx2*dx2 + dy2*dy2;
			if (d1 > d2)
				return null;
		} 
	}
	this.direction = prev_direction;
	return dir;
}
Zombie.prototype.move = function() {
//calculate next zombie coordinates
	var zc = this.detect_zombie_collision();
	if (zc == null) return;
	this.direction = zc;
	var dice = Math.random();
	if (this.killpause) {
		//after a collision with the player set the zombie to pause mode.
		//in pause mode the zombie cannot harm the player. a 40 % chance of
		//flipping out of kill pause each round.
		if (dice < 0.4) this.killpause = false; 
		else return; //pause the zombie
	}
	if (dice < 0.4) { //40% change of a pause.
	}
	if (dice < 0.6) {//20% chance of a direction alteration 
		//this.direction += Math.PI / 4;
		//TODO: find a decent way of doing this. This way just squirks
	}
	var interval = Math.ceil((C.frame / (this.vel * 10)));
	this.sprite = C.images.zombie[(interval % C.images.zombie.length)];
	var newy = Math.cos(zc) * this.vel;
	var newx = Math.sin(zc) * this.vel;
	this.y += newy;
	this.x += newx;
	if (Util.detect_collision(C.player.x, C.player.y, C.player.radius,
			this.x,this.y,this.radius)) {
		this.killpause = true;
		C.player.zombie_collide(this);
	}
}
Zombie.prototype.draw = function() {
//draw a zombie on the canvas
	var w = C.images.zombie[0].width/2;
	var h = C.images.zombie[0].height/2;
	var p = ~~((this.health / 100) * w);
	C.ctx.save();
	C.ctx.translate(this.x,this.y);
	C.ctx.rotate(Math.PI-this.direction);
	C.ctx.drawImage(this.sprite,0-w,0-h);
	C.ctx.beginPath();
	C.ctx.strokeStyle = 'red';
	C.ctx.moveTo(-w+5,h-10);
	C.ctx.lineTo(-w+10+p,h-10);
	C.ctx.closePath();
	C.ctx.stroke();
	C.ctx.restore();
}
Zombie.prototype.hit = function(projectile) {
//zombie got hit by a projectile
	this.health -= projectile.damage;
	if (this.health < 0) this.die();
}

Zombie.prototype.die = function() {
	for (var i in C.zombies) {
		var z = C.zombies[i];
		if (z.id == this.id) {
			C.zombies.splice(i,1);
			C.zombies_alive--;
			C.dead.push(this);
			//complete the level if dead zombies are more than total allowed
			//and if all zombies on the screen are dead
			C.player.add_xp();
			if (C.dead.length >= C.zombie_count && C.zombies.length == 0) 
				C.levelcomplete();
			console.log("dead zombie direction: %f",this.direction * 180/Math.PI);
			return;
		}
	}
}
