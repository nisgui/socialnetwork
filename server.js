var express = require("express");
var app = express();

var formidable = require("express-formidable");
app.use(formidable());

var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var http = require("http").createServer(app);
var bcrypt = require("bcrypt");
var fileSystem = require("fs");

var jwt = require("jsonwebtoken");
var accessTokenSecret = "myAccessTOkenSecret1234567890";


app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var socketIO = require("socket.io")(http);
var socketID = "";
var users = [];

var mainURL = "http://localhost:3000";

socketIO.on("connection", function(socket){
	console.log("User connected", socket.id);
	socketID = socket.id;

	});

http.listen(3000, function() {
	console.log("Server started.");

	mongoClient.connect("mongodb://localhost:27017", function(error, client){
		var database = client.db("my_social_network");
		console.log("Database connected.");


		app.get("/", function(req, res){
			res.sendFile(__dirname +"/index.html");
		});


		app.get("/signup", function(request, result){
			result.render("signup");
		});

		app.get("/pesquisador", function(request, result){
			result.render("pesquisador");
		});



		app.post("/signup", function(request, result){
			var name = request.fields.name;
			var username = request.fields.username;
			var date = request.fields.date;
			var cpf = request.fields.cpf;
			var email = request.fields.email;
			var temas = request.fields.temas;
			var password = request.fields.password;
			var gender = request.fields.gender;

			database.collection("users").findOne({
				$or: [{
					"email": email
				},{
					"username": username
				}]
			}, function(error, user) {
				if(user == null){
					bcrypt.hash(password, 10, function(error, hash){
						database.collection("users").insertOne({
							"name": name,
							"username": username,
							"date": date,
							"cpf": cpf,
							"email": email,
							"temas": temas,
							"password": hash,
							"gender": gender,
							"profileImage": "",
							"coverPhoto": "",
							"dob": "",
							"city": "",
							"country": "",
							"abotMe": "",
							"friends": [],
							"pages": [],
							"notifications": [],
							"groups": [],
							"posts": []
						}, function(error, data){
							result.json({
								"status": "sucess",
								"message": "Signed up sucessfully. You can login now"

							});
						});
					});
				} else{
					result.json({
						"status": "error",
						"message": "Email or username already exist"
					});
				}

			
			});
			
		});

		app.post("/pesquisador", function(request, result){
			var name = request.fields.name;
			var username = request.fields.username;
			var date = request.fields.date;
			var date2 = request.fields.date2;
			var email = request.fields.email;
			var estado = request.fields.estado;
			var cidade = request.fields.cidade;
			var local = request.fields.local;
			var nivel = request.fields.nivel;
			var link = request.fields.link;
			var password = request.fields.password;
			var gender = request.fields.gender;

			database.collection("users").findOne({
				$or: [{
					"email": email
				},{
					"username": username
				}]
			}, function(error, user) {
				if(user == null){
					bcrypt.hash(password, 10, function(error, hash){
						database.collection("users").insertOne({
							"name": name,
							"username": username,
							"date": date,
							"date2": date2,
							"email": email,
							"estado": estado,
							"cidade": cidade,
							"local": local,
							"nivel": nivel,
							"link": link,
							"temas": "",
							"password": hash,
							"gender": gender,
							"profileImage": "",
							"coverPhoto": "",
							"dob": "",
							"city": "",
							"country": "",
							"abotMe": "",
							"friends": [],
							"pages": [],
							"notifications": [],
							"groups": [],
							"posts": []
						}, function(error, data){
							result.json({
								"status": "sucess",
								"message": "Signed up sucessfully. You can login now"

							});
						});
					});
				} else{
					result.json({
						"status": "error",
						"message": "Email or username already exist"
					});
				}

			
			});
			
		});

		app.get("/login", function(request, result){
			result.render("login");
		});

		app.post("/login", function(request, result){
			var email = request.fields.email;
			var password = request.fields.password;
			database.collection("users").findOne({
				"email": email
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "Email does not exist"
					});
				} else {
					bcrypt.compare(password, user.password, function (error, isVerify){
						if(isVerify){
							var accessToken = jwt.sign({ email:email }, accessTokenSecret);
							database.collection("users").findOneAndUpdate({
								"email": email
							},{
								$set: {
									"accessToken": accessToken
								}
							}, function (error, data){
								result.json({
									"status": "success",
									"message": "Login Successfully",
									"accessToken": accessToken,
								});
							});
						} else {
							result.json({
								"status": "error",
								"message": "Password is not Correct"
							});
						}
					});
				}
			});

		});

		//user Profile page
		app.get("/updateProfile", function(request, result){
			result.render("updateProfile");
		});

		app.post("/getUser", function(request, result){
			var accessToken = request.fields.accessToken;
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user ==null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login again."
					});
				} else{
					result.json({
						"status": "success",
						"message": "Record has been fetched.",
						"data": user
					});
				}
			});
		});

		app.get("/logout", function(request, result){
			result.redirect("/login");
		});

		//profile cover photo update
		app.post("/uploadCoverPhoto", function(request, result){
			var accessToken = request.fields.accessToken;
			var coverPhoto = "";
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login  again."
					});
				} else {
					if(request.files.coverPhoto.size > 0 && request.files.coverPhoto.type.includes("image")){
						//previous cover photo remove
						if(user.coverPhoto != ""){
							fileSystem.unlink(user.coverPhoto, function(error){
								
							});
						}
						coverPhoto = "public/images/" + new Date().getTime() + "-" + request.files.coverPhoto.name;
						fileSystem.rename(request.files.coverPhoto.path, coverPhoto, function(error){
							
						});
						database.collection("users").updateOne({
								"accessToken": accessToken
							}, {
								$set: {
									"coverPhoto": coverPhoto
								}
						}, function(error, data){
							result.json({
								"status": "status",
								"message": "Cover photo has been updated.",
								"data": mainURL + "/" + coverPhoto
							});
						});							
					} else {
						result.json({
							"status": "error",
							"message": "Please select valid image."
						});
					}
				}
			});
		});

		app.post("/uploadProfileImage", function(request, result){
			var accessToken = request.fields.accessToken;
			var profileImage = "";

			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login  again."
					});
				} else {
					if(request.files.profileImage.size > 0 && request.files.profileImage.type.includes("image")){
						//previous cover photo remove
						if(user.profileImage != ""){
							fileSystem.unlink(user.profileImage, function(error){
								
							});
						}
						profileImage = "public/images/" + new Date().getTime() + "-" + request.files.profileImage.name;
						fileSystem.rename(request.files.profileImage.path, profileImage, function(error){
							
						});
						database.collection("users").updateOne({
								"accessToken": accessToken
							}, {
								$set: {
									"profileImage": profileImage
								}
						}, function(error, data){
							result.json({
								"status": "status",
								"message": "Profile image has been updated.",
								"data": mainURL + "/" + profileImage
							});
						});							
					} else {
						result.json({
							"status": "error",
							"message": "Please select valid image."
						});
					}
				}
			});
		});
		//update profile		
		app.post("/updateProfile", function(request, result){
			var accessToken = request.fields.accessToken;
			var name = request.fields.name;
			var date = request.fields.date;
			var aboutMe = request.fields.aboutMe;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login aagain."
					});
				} else {
					database.collection("users").updateOne({
						"accessToken": accessToken
					},{
						$set: {
							"name": name,
							"date": date,
							"aboutMe": aboutMe
						}
					}, function(error, data){
						result.json({
							"status": "status",
							"message": "Profile has been updated."	
						});
					});
				}
			});
		});

		app.get("/home", function(request, result){
			result.render("home");
		});

		app.post("/addPost", function(request, result){
			var accessToken = request.fields.accessToken;
			var caption = request.fields.caption;
			var image = "";
			var video = "";
			var type = request.fields.type;
			var createdAt = new Date().getTime();
			var _id = request.fields._id;
			
			database.collection("users").findOne({
				"accessToken":  accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been Logged out. Please login again."
					});
				} else {
					if(request.files.image.size > 0 && request.files.image.type.includes("image")){
						image = "public/images/" + new Date().getTime() + "-" + request.files.image.name;
						fileSystem.rename(request.files.image.path, image, function(error){
							
						});
					}
					if(request.files.video.size > 0 && request.files.video.type.includes("video")){
						video = "public/videos/" + new Date().getTime() + "-" + request.files.video.name;
						fileSystem.rename(request.files.video.path, video, function(error){
							
						});

					} else if(type == "group_post"){ //group post add START
					database.collection("groups").findOne({
						"_id": ObjectId(_id)
					}, function(error,group){
						if(group == null){
							result.json({
								"status": "error",
								"message": "Group does not exist."
							});
							return;
						} else {
							
							var isMember = false;
							for(var a=0; a < group.members.length; a++){
								var member = group.members[a];
								
								if(member._id.toString() == user._id.toString()){
									isMember = true;
									break;
								}
							}
							
							if(!isMember){
								result.json({
									"status": "error",
									"message": "sorry, you are not a member of this group."
								});
								return;
							}
							
							database.collection("posts").insertOne({
								"caption": caption,
								"image": image,
								"video": video,
								"type": type,
								"createdAt": createdAt,
								"likers": [],
								"comments": [],
								"shares": [],
								"user": {
									"_id": group._id,
									"name": group.name,
									"profileImage": group.coverPhoto
								},
								"uploader": {
									"_id": user._id,
									"name": user.name,
									"profileImage": user.profileImage
								}								
							}, function(error, data){
								result.json({
									"status": "success",
									"message": "Post has been uploaded."
								});
							});
						}
					});
				} //group post END
				else {
					//create User post 	
					database.collection("posts").insertOne({
						"caption": caption,
						"image": image,
						"video": video,
						"type": type,
						"createdAt": createdAt,
						"likers": [],
						"comments": [],
						"shares": [],
						"user":{
							"_id": user._id,
							"name": user.name,
							"profileImage": user.profileImage
						}
					}, function(error, data) {
						database.collection("users").updateOne({
							"accessToken": accessToken
						}, {
							$push: {
								"posts": {
									"_id": data.insertId,
									"caption":caption,
									"image": image,
									"video": video,
									"type": type,
									"createdAt": createdAt,
									"likers": [],
									"comments": [],
									"shares": []
								}
							}
						},function(error, data){
							result.json({
								"status": "success",
								"message": "Post has been uploaded"
							});
						});
					});
				}
			}
		});
	});

		app.post("/getNewsfeed", function(request, result) {
		var accessToken = request.fields.accessToken;
		
		database.collection("users").findOne({
			"accessToken": accessToken
		}, function(error, user){
			if(user == null){
				result.json({
					"status": "error",
					"message": "User has been logged out. Please login again."				
				});
			} else {				
				var ids = [];
				ids.push(user._id);				
				/* var username = [];
				username.push(user.name); */

				for(var a = 0 ; a < user.pages.length; a++){
					ids.push(user.pages[a]._id);
				}
				
				database.collection("posts").find({					
					"user._id": {
						$in: ids
					}
				})
				.sort({
					"createdAt": -1
				})
				.limit(5)
				.toArray(function(error, data){
					
					result.json({
						"status": "success",
						"message": "Record has been fetched",						
						"data": data
					});					
				});			
			}
		});
	});

	//like section
	app.post("/toggleLikePost", function(request, result){
		var accessToken = request.fields.accessToken;
		var _id = request.fields._id;
		
		database.collection("users").findOne({
			"accessToken": accessToken
		}, function(error, user){
			if(user == null){
				result.json({
					"status": "error",
					"message": "User has been logged out. Please login again."
				});
			} else {
				database.collection("posts").findOne({
					"_id": ObjectId(_id)
				}, function(error, post){
					if(post == null){
						result.json({
							"status": "error",
							"message": "Post does not exist."
						});
					} else {
						var isLiked = false;
						for(var a = 0; a < post.likers.length; a++){
							var liker = post.likers[a];
							
							if(liker._id.toString() == user._id.toString()){
								isLiked = true;
								break;
							}
						}
						if(isLiked){
							database.collection("posts").updateOne({
								"_id":ObjectId(_id)
							},{
								$pull:{
									"likers":{
										"_id": user._id,
									}
								}
							}, function(error, data){
								database.collection("users").updateOne({
									$and: [{
										"_id": post.user._id
									},{
										"post._id": post._id
									}]
								},{
									$pull: {
										"posts.$[].likers": {
											"_id": user._id,
										}
									}
								});
								
								result.json({
									"status": "unliked",
									"message": "Post foi descurtido."
								});
							})
						} else{
							database.collection("users").updateOne({
								"_id": user._id
							},{
								$push: {
									"notifications": {
										"_id": ObjectId(),
										"type": "photo_liked",
										"content": user.name + " curtiu o seu post.",
										"profileImage": user.profileImage,
										"createdAt": new Date().getTime()
									}
								}
							});
							
							database.collection("posts").updateOne({
								"_id": ObjectId(_id)
							}, {
								$push: {
									"likers": {
										"_id": user._id,
										"name": user.name,
										"profileImage": user.profileImage
									}
								}
							}, function(error, data){
								database.collection("users").updateOne({
									$and: [{
										"_id": post.user._id
									},{
										"posts._id": post._id
									}]
								},{
									$push: {
										"posts.$[].likers": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage
										}
									}
								});
								
								result.json({
									"status": "success",
									"message": "Post foi curtido."
								});
							});
						}
					}
				});
			}
		});
	});

	//comment section
	app.post("/postComment", function(request, result){
		var accessToken = request.fields.accessToken;
		var _id = request.fields._id;
		var comment = request.fields.comment;
		var createdAt = new Date().getTime();
		
		database.collection("users").findOne({
			"accessToken": accessToken
		}, function(error, user){
			if(user == null){
				result.json({
					"status": "error",
					"message": "User has been logged out. Please login again."
				});
			} else {
				database.collection("posts").findOne({
					"_id": ObjectId(_id)
				}, function(error, post){
					if(post == null){
						result.json({
							"status": "error",
							"message": "Post does not exist."
						});
					} else{
						var commentId = ObjectId();
						database.collection("posts").updateOne({
							"_id": ObjectId(_id)
						},{
							$push: {
								"comments": {
									"_id": commentId,
									"user": {
										"_id": user._id,
										"name": user.name,
										"profileImage": user.profileImage,
									},
									"comment": comment,
									"createdAt": createdAt,
									"replies": []
								}
							}
						}, function(error, data){
							//check post id and user id not equal
							if(user._id.toString() != user._id.toString()){
								database.collection("users").updateOne({
									"_id": user._id
								},{
									$push: {
										"notifications": {
											"_id": ObjectId(),
											"type": "new_comment",
											"content": user.name + " commented on your post.",
											"profileImage": user.profileImage,
											"createdAt": new Date().getTime()
										}
									}
								});
							}
							database.collection("users").updateOne({
								$and: [{
									"_id": post.user._id
								},{
									"posts._id": post._id
								}]
							},{
								$push: {
									"posts.$[].comments": {
										"_id": commentId,
										"user": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage,
										},
										"comment": comment,
										"createdAt": createdAt,
										"replies": []
									}
								}
							});
							result.json({
								"status": "success",
								"message": "Seu comentario foi postado.",
							});
						});
					}
				});
			}
		});
	});

	//reply comment section
	app.post("/postReply", function(request, result){
		var accessToken = request.fields.accessToken;
		var postId = request.fields.postId;
		var commentId = request.fields.commentId;
		var reply = request.fields.reply;
		var createdAt = new Date().getTime();
		
		database.collection("users").findOne({
			"accessToken": accessToken
		},function(error, user){
			if(user == null){
				result.json({
					"status": "error",
					"message": "User has been logged ouot. Please login again."
				});
			} else {
				database.collection("posts").findOne({
					"_id": ObjectId(postId)
				}, function(error, post){
					
					if(post == null){
						result.json({
							"status": "error",
							"message": "Post does not exist."
						});
					} else {
						var replyId = ObjectId();
						database.collection("posts").updateOne({
							$and: [{
								"_id": ObjectId(postId) 
							},{
								"comments._id": ObjectId(commentId) 
							}]
						},{
							$push: {
								"comments.$.replies": {
									"_id": replyId, 
									"user": {
										"_id": user._id,
										"name": user.name,
										"profileImage": user.profileImage,
									},
									"reply": reply,
									"createdAt": createdAt
								}
							}
						},function(error, data){
							database.collection("users").updateOne({
								$and: [{
									"_id": post.user._id
								},{
									"posts._id": post._id
								},{
									"posts.comments._id": ObjectId(commentId)
								}]
							},{
								$push: {
									"posts.$[].comments.$[].replies": {
										"_id": replyId,
										"user": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage,
										},
										"reply": reply,
										"createdAt": createdAt
									}
								}
							});							
							result.json({
								"status": "success",
								"message": "Reply foi postada.",
							});
						});						
					}
				});
			}
		});
	});

	//share Post
	app.post("/sharePost", function(request, result){
			
		var accessToken = request.fields.accessToken;
		var _id = request.fields._id;
		var type = "shared";
		var createdAt = new Date().getTime();
		
		database.collection("users").findOne({
			"accessToken": accessToken
		}, function(error, user){
			if(user == null){
				result.json({
					"status": "error",
					"message": "User has been logged out. Please login again."
				});
			} else {
				database.collection("posts").findOne({
					"_id": ObjectId(_id)
				}, function(error, post){
					if(post == null){
						result.json({
							"status": "error",
							"message": "Post does not exist."
						});
					} else {
						database.collection("posts").updateOne({
							"_id": ObjectId(_id)
						},{ 
							$push: {
								"shares": {
									"_id": user._id,
									"name": user.name,
									"profileImage": user.profileImage
								}
							}
						}, function(error, data){
							database.collection("posts").insertOne({
								"caption": post.caption,
								"image": post.image,
								"video": post.video,
								"type": type,
								"createdAt": createdAt,
								"likers": [],
								"comments": [],
								"shares": [],
								"user":{
									"_id": user._id,
									"name": user.name,
									"gender": user.gender,
									"profileImage": user.profileImage
								}
							}, function(error, data){
								database.collection("users").updateOne({
									$and: [{
										"_id": post.user._id
									},{
										"posts._id": post._id
									}]
								},{
									$push: {
										"posts.$[].shares": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage
										}
									}
								});
								result.json({
									"status": "success",
									"message": "Post has been shared.",
								});
							});
						});
					}
				});
			}
		});
	});

	//search function
		app.get("/search/:query", function(request, result){
			var query = request.params.query;
			result.render("search", {
				"query": query
			});
		});


		app.post("/search", function(request, result){
			var query = request.fields.query;
			//search user name
			database.collection("users").find({
				"name":{
					$regex: ".*" + query + ".*",
					$options: "i"
				} 
			}).toArray(function(error, data){
				//search created page name
				database.collection("pages").find({
					"name": {
						$regex: ".*" + query + ".*",
						$options: "i"
					}
				}).toArray(function (error, pages){
					
					database.collection("groups").find({
						"name": {
							$regex: ".*" + query + ".*",
							$options: "i"
						}
					}).toArray(function(error, groups){
						result.json({
							"status": "success",
							"message": "Record has been fetched",
							"data": data,
							"pages": pages,
							"groups": groups
						});
					});				
				});				
			});
		});

		//friend Request send
		app.post("/sendFriendRequest", function(request, result){
			var accessToken = request.fields.accessToken;
			var _id = request.fields._id;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login again"
					});
				} else {
					var me = user;
					database.collection("users").findOne({
						"_id": ObjectId(_id)
					}, function(error, user){
						if(user == null){
							result.json({
								"status": "error",
								"message": "user does not exist."
							});							
						} else {
							database.collection("users").updateOne({
								"_id": ObjectId(_id)
							},{
								$push: {
									"friends":{
										"_id": me._id,
										"name": me.name,
										"profileImage": me.profileImage,
										"status": "Pending",
										"sentByMe": false,
										"inbox": []
									}
								}
							}, function(error, data){
								database.collection("users").updateOne({
									"_id": me._id
								}, {
									$push:{
										"friends": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage,
											"status": "Pending",
											"sentByMe": true,
											"inbox": []
										}
									}
								}, function(error, data){
									result.json({
										"status": "success",
										"message": "Friend request has been sent."
									});
								});
							});
						}
					});
				}
			});			
		});

		//friend request accepted section
		app.get("/friends", function(request, result){
			result.render("friends");
		});
		
		app.post("/acceptFriendRequest", function(request, result){
			var accessToken = request.fields.accessToken;
			var _id = request.fields._id;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error" ,
						"message": "User has been logged out. Please login again."						
					});
				} else {
					var me = user;
					database.collection("users").findOne({
						"_id": ObjectId(_id)
					}, function(error, user){
						if(user == null){
							result.json({
									"status": "error" ,
									"message": "User does not exist."						
								});
						} else {
							database.collection("users").updateOne({
								"_id": ObjectId(_id)
							},{
								$push: {
									"notifications": {
										"_id": ObjectId(),
										"type": "friend_request_accepted",
										"content": me.name + " accepted your friend request.",
										"profileImage": me.profileImage,
										"createdAt": new Date().getTime()
									}
								}
							});
							
							database.collection("users").updateOne({
								$and: [{
									"_id": ObjectId(_id)
								},{
									"friends._id": me._id
								}]
							},{
								$set: {
									"friends.$.status": "Accepted"
								}
							}, function(error, data){
								database.collection("users").updateOne({
									$and: [{
										"_id": me._id
									},{
										"friends._id": user._id
									}]
								},{
									$set:{
										"friends.$.status": "Accepted"
									}
								}, function(error, data){
									result.json({
										"status": "success",
										"message": "Friend request has been accepted."
									});
								});
							});
						}
					});
				}
			});
		});

		//friend request Unfriend section
		app.post("/unfriend", function(request, result){
			var accessToken = request.fields.accessToken;
			var _id = request.fields._id;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error" ,
						"message": "User has been logged out. Please login again."						
					});
				} else {
					var me = user;
					database.collection("users").findOne({
						"_id": ObjectId(_id)
					}, function(error, user){
						if(user == null){
							result.json({
									"status": "error" ,
									"message": "User does not exist."						
								});
						} else {
							database.collection("users").updateOne({
								"_id": ObjectId(_id)
							},{
								$pull: {
									"friends": {
										"_id": me._id
									}
								}
							}, function(error, data){
								database.collection("users").updateOne({
									"_id": me._id
								},{
									$pull: {
										"friends": {
											"_id": user._id
										}
									}
								}, function(error, data){
									result.json({
										"status": "success",
										"message": "Friend has been removed."
									});
								});
							});
						}
					});
				}
			});
		});

		//create page
		app.get("/createPage", function(request, result){
			result.render("createpage");
		});

		app.post("/createPage", function(request, result){
			var accessToken = request.fields.accessToken;
			var name = request.fields.name;
			var local = request.fields.local;
			var ano = request.fields.ano;
			var domainName = request.fields.domainName;
			var additionalInfo = request.fields.additionalInfo;

			
			database.collection('users').findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login again."
					});
				} else {
						database.collection("pages").insertOne({
							"name": name,
							"local": local,
							"ano": ano,
							"domainName": domainName,
							"additionalInfo": additionalInfo,
							"likers": [],
							"user": {
								"_id": user._id,
								"name": user.name,
								"profileImage": user.profileImage
							}
						}, function(error, data){
							result.json({
								"status": "success",
								"message": "page has been created."
							});
						});
					
				}					
			});
		});

		app.get("/pages", function (request, result){
			result.render("pages");
		});

		app.post("/getPages", function (request, result){
			var accessToken = request.fields.accessToken;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){					
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login again."
					});
				} else {
					database.collection("pages").find({
						$or: [{
							"user._id": user._id
						},{
							"likers._id": user._id
						}]
					}).toArray(function (error, data){
						result.json({
							"status": "success",
							"message": "Record has been fetched.",
							"data": data							
						});
					});
				}
			});
		});

		app.post("/toggleLikePage", function(request, result){
			var accessToken = request.fields.accessToken;
			var _id = request.fields._id;
			
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out.Please login again."
					});
				} else {
					database.collection("pages").findOne({
						"_id": ObjectId(_id)
					}, function(error, page){
						if(page == null){
							result.json({
								"status": "error",
								"message": "Page does not exist."
							});
						} else {
							var isLiked = false;
							for (var a = 0; a < page.likers.length; a++){
								var liker = page.likers[a];
								
								if(liker._id.toString() == user._id.toString()){
									isLiked = true;
									break;
								}
							}
							
							if(isLiked){
								database.collection("pages").updateOne({
									"_id": ObjectId(_id)
								},{
									$pull: {
										"likers": {
											"_id": user._id
										}
									}
								}, function(error, data){
									database.collection("users").updateOne({
										"accessToken": accessToken
									},{
										$pull: {
											"pages": {
												"_id": ObjectId(_id)
											}
										}
									}, function(error, data){
											result.json({
												"status": "unliked",
												"message": "Page has been unliked."
											});
										});
									});
								} else {
									
									database.collection("pages").updateOne({
										"_id": ObjectId(_id)
									},{
										$push: {
											"likers": {
												"_id": user._id,
												"name": user.name,
												"profileImage": user.profileImage
											}
										}
									}, function(error, data){
										
										database.collection("users").updateOne({
											"accessToken": accessToken
										},{
											$push: {
												"pages": {
													"_id": page._id,
													"name": page.name,
												}
											}
										}, function(error, data){
											result.json({
												"status": "success",
												"message": "Page has been liked."
											});
										});									
									});
								}
							}
						});						
					}
				});
			});

		//create Group
		app.get("/createGroup", function(request, result){
			result.render("createGroup");
		});

		app.post("/createGroup", function(request, result){
				
				 var accessToken = request.fields.accessToken;
				 var name = request.fields.name;
				 var additionalInfo = request.fields.additionalInfo;
				 var coverPhoto = "";
				 
				 database.collection("users").findOne({
					"accessToken": accessToken					
				 }, function(error, user){
					 if(user == null){
						 result.json({
							 "status": "error",
							 "message": "User has been logged out. Please login again."
						 });
					 } else {
						
						if(request.files.coverPhoto.size > 0 && request.files.coverPhoto.type.includes("image")){
							coverPhoto = "public/images/" + new Date().getTime() + "-" + request.files.coverPhoto.name;
							fileSystem.rename(request.files.coverPhoto.path, coverPhoto, function(error){
								//
							});
							
							database.collection("groups").insertOne({
								"name": name,
								"additionalInfo": additionalInfo,
								"coverPhoto": coverPhoto,
								"members":[{
									"_id": user._id,
									"name": user.name,
									"profileImage": user.profileImage,
									"status": "Accepted"
								}],
								"user":{
									"_id": user._id,
									"name": user.name,
									"profileImage": user.profileImage
								}
							}, function(error, data){
								database.collection("users").updateOne({
									"accessToken": accessToken
								},{
									$push: {
										"groups": {
											"_id": data.insertedId,
											"name": name,
											"coverPhoto": coverPhoto,
											"status": "Accepted"
										}
									}
								}, function(error, data){
									result.json({
										"status": "success",
										"message": "Group has been created."
									});
								});
							});
						} else {
							result.json({
								"status": "error",
								"message": "Please select a cover photo."
							});
						}
					 }
				 })
			});
		app.get("/groups", function(request, result){
				result.render("groups");
			})
			
		app.post("/getGroups", function(request, result){
			var accessToken = request.fields.accessToken;
				
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged out. Please login again."
					});
				} else {
					
					database.collection("groups").find({
						$or: [{
							"user._id": user._id
						},{
							"members._id": user._id
						}]
					}).toArray(function(error, data){
						result.json({
							"status": "success",
							"message": "Record has been fetched.",
							"data": data
						});
					});
					}
				});
			});
		//group page id get
		app.get("/group/:_id", function(request, result){
			var _id = request.params._id;
			
			database.collection("groups").findOne({
				"_id": ObjectId(_id)
			}, function(error, group){
				if(group == null){
					result.json({
						"status": "error",
						"message": "Group does not exist."
					});
				} else {
					result.render("singleGroup", {
						"_id": _id
					});
				}
			});
		});
			
		app.post("/getGroupDetail", function(request, result){
			var _id = request.fields._id;
				
			database.collection("groups").findOne({
				"_id": ObjectId(_id)
			}, function(error, group){
				if(group == null){
					result.json({
						"status": "error",
						"message": "Group does not exist."
					});
				} else {
						
					database.collection("posts").find({
						$and: [{
							"user._id": group._id
						},{
							"type": "group_post"
						}]
					}).toArray(function(error, posts){
						result.json({
							"status": "success",
							"message": "Record has been fetched.",
							"data": group,
							"posts": posts
						});
					});
				}
			});
		});

		app.post("/toggleJoinGroup", function(request, result){
			var accessToken = request.fields.accessToken;
			var _id = request.fields._id;
				
			database.collection("users").findOne({
				"accessToken": accessToken
			}, function(error, user){
				if(user == null){
					result.json({
						"status": "error",
						"message": "User has been logged Out. Please login agein."
					});
				} else {
					database.collection("groups").findOne({
						"_id": ObjectId(_id)
					}, function(error, group){
						if(group == null){
							result.json({
								"status": "error",
								"message": "Group does not exist."
							});
						} else {
								
							var isMember = false;
							for(var a=0; a < group.members.length; a++){
								var member = group.members[a];
								
								if(member._id.toString() == user._id.toString()){
									isMember = true;
									break;
								}
							}
								
							if(isMember){
								database.collection("groups").updateOne({
									"_id": ObjectId(_id)
								}, {
									$pull: {
										"members": {
											"_id": user._id
										}
									}
								}, function(error, data){
									database.collection("users").updateOne({
										"accessToken": accessToken
									}, {
										$pull: {
											"groups": {
												"_id": ObjectId(_id)
											}
										}
									}, function(error, data){
										result.json({
											"status": "leaved",
											"message": "Group has been left."
										});
									});
								});
							} else {
								database.collection("groups").updateOne({
									"_id": ObjectId(_id)
								},{
									$push: {
										"members": {
											"_id": user._id,
											"name": user.name,
											"profileImage": user.profileImage,
											"status": "Pending"
										}
									}
								}, function(error, data){
										
									database.collection("users").updateOne({
										"accessToken": accessToken
									},{
										$push: {
											"groups": {
												"_id": group._id,
												"name": group.name,
												"coverPhoto": group.coverPhoto,
												"status": "Pending"
											}
										}
									},function(error, data){
										
										database.collection("users").updateOne({
											"_id": group.user._id
										},{
											$push:{
												"notifications":{
													"_id": ObjectId(),
													"type": "group_join_request",
													"content": user.name + " juntou ao seu grupo.",
													"profileImage": user.profileImage,
													"groupId": group._id,
													"userId": user._id,
													"status": "Pending",
													"createdAt": new Date().getTime()
												}
											}
										});
										
										result.json({
											"status": "success",
											"message": "Você entrou no grupo."
										});
									});
								});
							}
						}
					});
				}
			});
		});

		app.get("/notifications", function(request, result){
				result.render("notifications");
		});

		
	});		
});
