// ==UserScript==
// @name           dubtrack-playlist-exporter
// @description    Creates dubtrack playlist JSON files, and saves them to harddrive.
// @author         L0laapk3
// @include        https://www.dubtrack.fm/*
// @version        1.0
// @grant          none
// ==/UserScript==


/*
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function main() {
	$.getScript("https://media.sq10.net/pye/FileSaver.js", function() {
		$("<div><p style='color:#F00;display:inline'>[dub2yt]</p> <p style='color:#F00;font-weight:bold;display:inline'>Click <a style='text-decoration:underline;cursor:pointer'>here</a> to generate playlist file.</p></div>")
		.appendTo(".chat-main").find("a").one("click", function() {
			startGenerate();
		});

		var total = 0;
		var k = 1;

		function startGenerate() {
			$(".chat-main").append("<div><p style='color:#F00;display:inline'>[dub2yt]</p> <p style='color:#F00;font-weight:bold;display:inline'>Gathering playlist information..</p></div>");
			$(".chat-messages").scrollTop(Number.MAX_VALUE);
				
			var output = {"is_plugdj_playlist":true,"userid":$("div.user-info span").text(),"playlists":{}};

			$.ajax({
				url: "https://api.dubtrack.fm/playlist",
				success: function(a) {
					total = a.data.map(function(b) {
						return Math.ceil(parseFloat(b.totalItems, 10) / 20);
					}).reduce(function(b, c) {
						return b + c;
					});
					var i = a.data.length;
					a.data.forEach(function(e, j) {
						getFullPlaylist(e._id, function(b) {
							output.playlists[e.name] = b.map(function(c) {
								return {type: c["_song"].type === "youtube" ? 1 : 2, id: c["_song"].fkid};
							});
							if (!--i) {
								$(".chat-main").append("<div><p style='color:#F00;display:inline'>[dub2yt]</p> <p style='color:#F00;font-weight:bold;display:inline'>Finished. Starting download.</p></div>");
								$(".chat-main").append("<div><p style='color:#F00;display:inline'>[dub2yt]</p> <p style='color:#F00;font-weight:bold;display:inline'>Upload the file to <a style='text-decoration:underline;cursor:pointer' href='http://pye.sq10.net/' target='_blank'>pye.sq10.net</a> to convert it into a youtube playlist!</p></div>");
								$(".chat-messages").scrollTop(Number.MAX_VALUE);
								
								var blob = new Blob(
									[JSON.stringify(output)],
									{
										type: "application/json;charset=utf-8"
									}
								);
								saveAs(blob, "DUBTRACK_PLAYLISTS.json");
							}
						});
					});
				}
			});
		}


		function getFullPlaylist(id, callback, i, songs) {
			$(".chat-main").append("<div><p style='color:#F00;display:inline'>[dub2yt]</p> <p style='color:#F00;font-weight:bold;display:inline'>Gathering playlist information.. [" + k++ + "/" + total + "]</p></div>");
			$(".chat-messages").scrollTop(Number.MAX_VALUE);
			
			i = i || 1;
			songs = songs || [];
			$.ajax({
				url: "https://api.dubtrack.fm/playlist/" + id + "/songs?page=" + i,
				success: function(a) {
					songs = songs.concat(a.data);
					if (a.data.length === 20)
						getFullPlaylist(id, callback, i + 1, songs);
					else
						callback(songs);
				}
			});
		}
	});
}


function check() {
	if ($ && $(".chat-main").length)
		main();
	else
		setTimeout(check, 50);
}
check();