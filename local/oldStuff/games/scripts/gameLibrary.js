/**
 * @file gameLibrary.js
 * @author Elia Nitsche
 * @date 29.03.2024
 * @brief general game functions (rendering?, coordiante transformations, ...)
 */

class GameLibrary {

	/**
	 * @brief creates a 2d object
	 */
	static Point2D(x=0, y=0) {
		var point = {};
		point.x = x;
		point.y = y;
		return point; 
	}

	/**
	 * @brief compares two objects returns true if they are equal
	 * @return true if they are equal in values (checks recursivly, a string with an error if not
	 */
	static equals(obj1, obj2) {
		//console.log("\tequals");
		//console.log(obj1);
		//console.log(obj2);
		if(obj1 == obj2) return true;
		let prop1 = Object.getOwnPropertyNames(obj1);
		let prop2 = Object.getOwnPropertyNames(obj2);
		//console.log(prop1);
		//console.log(prop2);
		if(prop1.length != prop2.length) return "prop len";
		if(prop1.length < 1 && obj1 != obj2) return "value"
		for(let i=0;i<prop1.length;i++) {
			//console.log(this.equals(prop1[i],prop2[i]));
			if(!(this.equals(prop1[i],prop2[i]) == true)) return "prop names";
			let temp = this.equals(obj1[prop1[i]], obj2[prop2[i]])
			if(temp !== true) return temp;
		}
		return true;
	}

	/**
	 * @brief converts color names/spaces to hex #rrggbb
	 */
	static getHexColor(str) {
		var ctx = document.createElement("canvas").getContext("2d");
		ctx.fillStyle = str;
		return ctx.fillStyle;
	}
	/**
	 * @brief converts hex colors #rrggbb to rgba(r,g,b,a)
	 */
	static hexToRgbA(hex, a=1){
		var c;
		if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
			c= hex.substring(1).split('');
			if(c.length== 3){
				c= [c[0], c[0], c[1], c[1], c[2], c[2]];
			}
			c= '0x'+c.join('');
			return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+a+')';
		}
		throw new Error('GameLibrary.hexToRrbA: Bad Hex');
	}
	/**
	 * @brief converts color names/spaces to rgba(r,g,b,a)
	 */
	static getRGBAColor(str) {
		let hex = getHexColor(str);
		return hexToRgbA(hex);
	}

	/**
	 * @brief interpolation methods
	 * @param val1,val2 values to interpolate inbetween
	 * @param mu takes values between 0-1
	 */
	static LinearInterpolate(val1, val2, mu) {
		return val1*(1-mu) + val2*mu;
	}
	static CosineInterpolate(val1, val2, mu) {
		let m2 = (1-Math.cos(mu*Math.PI))/2;
		return val1*(1-m2) + val2*m2;
	}
}

export { GameLibrary as g };
