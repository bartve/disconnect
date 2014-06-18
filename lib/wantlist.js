module.exports = function(client){
	var wantlist = {};
	
	/**
	 * Get the list of wantlisted releases for the given user name
	 * @param {String} user - The user name
	 * @param {Object} [params] - Optional paging params
	 * @param {Function} [callback] - The callback
	 */
	
	wantlist.releases = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/wants';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	/**
	 * Add a release to the user's wantlist
	 * @param {String} user - The user name
	 * @param {Integer} release - The release ID
	 * @param {Object} [data] - Optional notes and rating 
	 * @param {Function} [callback] - The callback
	 */
	
	wantlist.addRelease = function(user, release, data, callback){
		if(client.authenticated()){
			var _data = data;
			if((arguments.length === 3) && (typeof data === 'function')){
				callback = data;
				_data = null;
			}
			client.put('/users/'+util.escape(user)+'/wants/'+release, _data, callback);
		}else{
			callback(new Error('You must be authenticated in order to add a release to a wantlist.'));
		}
	};
	
	/**
	 * Edit the notes or rating on a release in the user's wantlist
	 * @param {String} user - The user name
	 * @param {Integer} release - The release ID
	 * @param {Object} data - The notes and rating {notes: 'Test', rating: 4}
	 * @param {Function} [callback] - The callback
	 */
	
	wantlist.editNotes = function(user, release, data, callback){
		if(client.authenticated()){
			client.put('/users/'+util.escape(user)+'/wants/'+release, data, callback);
		}else{
			callback(new Error('You must be authenticated in order to edit the notes for a release in a wantlist.'));
		}
	};
	
	/**
	 * Remove a release from the user's wantlist
	 * @param {String} user - The user name
	 * @param {Integer} release - The release ID
	 * @param {Function} [callback] - The callback
	 */
	
	wantlist.removeRelease = function(user, release, callback){
		if(client.authenticated()){
			client.delete('/users/'+util.escape(user)+'/wants/'+release, callback);
		}else{
			callback(new Error('You must be authenticated in order to delete a release from a wantlist.'));
		}
	};
	
	return wantlist;
};