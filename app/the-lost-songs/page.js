"use client";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/app/assets";
import "@/styles/the-lost-songs.scss";

const SPOTIFY_ALBUM_URL =
  "https://open.spotify.com/album/0dbZCuF9B22PA9d0ZJnhaT?si=zh6EmpCOQiqTevdqogEagA&nd=1";

const SOUNDCLOUD_PLAYER_URL =
  "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1508540197&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true";

export default function TheLostSongs() {
  return (
    <>
      <Image
        className="big"
        src={ASSETS.melting}
        alt=""
        width={607}
        height={758}
      />
      <div className="the-lost-songs">
        <div className="the-lost-songs-header">
          <div className="the-lost-songs-album-cover">
            <Image src={ASSETS.lostSongs} alt="" width={500} height={500} />
          </div>
          <div className="the-lost-songs-album-text">
            <h1>Lost Songs</h1>
            <p>Out now on all platforms</p>
            <Link href={SPOTIFY_ALBUM_URL} target="_blank">
              Listen on Spotify
            </Link>
          </div>
        </div>
        <div className="the-lost-songs-map">
          <h2>You have found an old dusty map!</h2>
          <h3>It says this on the back:</h3>
          <p>
            <em>
              “If you are reading this, you must have stumbled across my CAVE OF
              LOST SONGS! Within you will find a collection of music that would
              have never seen the light of day if it wasn&apos;t for someone as
              curious as you going looking for them. I hope you enjoy exploring
              with me, and if you&apos;d like to hear my creator&apos;s thoughts
              on these sounds just continue reading!”
            </em>
            <br />
            <span>- Dark One</span>
          </p>
        </div>
        <div className="the-lost-songs-songs">
          <div className="the-lost-songs-song">
            <h4>1 MARY JANE</h4>
            <p>
              Wendigo sent me this beat earlier in the year when I was
              struggling with marijuana dependency. I take the substance and
              personify it as a beautiful woman in this song. It tells the story
              of a complicated relationship, feeling like you need something or
              someone but also feeling like it is destroying you and stopping
              you from growing positively.
              <br />
              <br />
              <em>
                Speaking of which I am going to go hit my bong before writing
                this next note. Be right back.
              </em>
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>2 AIR RAID FREESTYLE 2022</h4>
            <p>
              That was instantaneous for you but that took me a number of
              minutes. This here tune is just me punching in and coming up with
              a song as I go. Wendigo made this beat while we were together
              making music for The Small Dark One. I chose not to include it
              because my goal with TSDO was to be as concise as possible. This
              song felt too informal and more in the spirit of a single I would
              have dropped in 2019 or 2020. I chose to include it here however
              because fuck it whatever.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>3 TATS ON MY LEAN</h4>
            <p>
              Same goes for this song as in I was making it around the time of
              The Small Dark One and it wasn&apos;t included because it felt fun
              and informal in a way that I didn&apos;t think complimented the
              rest of the project. However, it is one of my favorites. Mainly
              because it is based. That is all.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>4 believe demo 2021</h4>
            <p>
              This demo was made a while ago. I made it because I feel like some
              people don&apos;t feel comfortable showing their teeth. Or
              standing up straight and just rapping. Even if some people think
              it&apos;s old-school and corny I grew up listening to music like
              that and making it brings me back to times I would freestyle with
              Wendigo while hanging out in New York or Cxrpse, Cube, and
              Bruhmane at a park in Long Beach. A lot of times the freestyles
              would be goofy and fun but sometimes they would be about something
              happening in the moment. Sometimes something intense or negative.
              This song just seeks to capture a moment of inspiration.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>5 untitled 2 (FT. WENDIGO)</h4>
            <p>
              I have been experimenting with making rock music and storytelling.
              I played the guitar and bass on this track. The drums are computer
              generated though. I would love to one day record this with a full
              band but I still think it&apos;s a pleasant demo to listen to. I
              like walking to it because the tempo is good for it. It&apos;s
              just dissonant enough for me to feel nice and on edge. And
              Wendigo&apos;s guitar tickles my ear. That is all. Murder song but
              I am not the murderer.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>6 LAY DOWN demo 2021</h4>
            <p>
              I was feeling very clever when I recorded the first verse on this
              song. You can tell by how I appear so confident and in control.
              Little did my clever little self know but I would hit a massive
              writers block at the speed of a sprinting Indian at exactly one
              minute and twenty one seconds or so. I proceeded to finish it
              about a week and a half ago because 1: I am better and rapping and
              2: It is fire and deserved to be finished. Here it is for your
              listening face.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>7 sisyphus drunk (freestyle)</h4>
            <p>
              Got drunk and made a rap. That is pretty much it. I am a very
              visual person when I listen to music. When I listen to this song I
              like to imagine Darkie pushing a boulder up a hill in a looping
              animation in my mind.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>8 running away</h4>
            <p>
              Honestly never released this song because I felt it was too
              imperfect and honestly too human. Now I find it captures some of
              my time spend as Lil Darkie very poetically so I am choosing to
              put it out.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>9 GRPR 2</h4>
            <p>
              This song was conceived during the Boros album creation period. I
              opted to omit it from the project which I later came to regret cuz
              it&apos;s fire and I think it would have maybe helped some people
              understand the project more. But I guess let sleeping dogs lie or
              sleep or whatever.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>10 untitled 3</h4>
            <p>
              Autotune screaming is fun and this song is about tear my soul out.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>11 time of the day</h4>
            <p>
              I recorded this around the Swamp era! Honestly just didn&apos;t
              drop it because I felt the timing for this as a single just
              wasn&apos;t right considering I had just dropped what I considered
              my craziest project at that time. Just me having fun. I wanna do a
              video in a fancy restaurant.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>12 untitled </h4>
            <p>
              This track is in the spirit of “believe demo 2021” but I made it
              much more recently by comparison. I like that you can hear my
              growth.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>13 YOU OWE ME ONE</h4>
            <p>
              A time of despair and inner self induced anguish inspired this
              looping, hypnotic song. I directed my anger outward when I should
              have turned my gaze inward. Even if someone else is doing
              something you know is wrong, it is never right to become negative
              as a result. This song is a release of that hateful, selfish
              emotion by allowing it to show its ugly face and dissipate.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>14 BORAT swamp b-side 2020</h4>
            <p>
              I almost wasn&apos;t going to put songs 14, 15, and 16 on the
              project but Wendigo inspired me otherwise. I was looking through
              my old music with him on the phone and this song played. He said
              it should go on there because the fans who love our old music
              would love it. I initially resisted because I ended up not putting
              this song on Swamp because it felt too on the nose as a “song
              Darkie would make”. But I realized he was right. Some of my fans
              would find this song a fun return to something I have moved away
              from somewhat and that is CRAZY MIDDLE EASTERN THEMED SONGS.
              Honestly maybe I&apos;m bugging and should make another sometime
              lol.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>16 SOULD yang b-side 2019</h4>
            <p>
              It is old as shit and I was experimenting with new sounds. It is
              very rough but for some reason something about it is redeeming and
              I don&apos;t know what it is but it&apos;s there.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>17 small dark (freestyle)</h4>
            <p>Small song. Too small for single. What do? Put here.</p>
          </div>
          <div className="the-lost-songs-song">
            <h4>18 if only you knew</h4>
            <p>
              I was just messing around when I sat down to record this. Ended up
              making one of the most beautiful and wholesome songs I have ever
              made. Just never had a place on a project. But it ends this
              journey quite perfectly if I do say so myself. Also some of
              Wendigo&apos;s best guitar work if I do say so myself again.
            </p>
          </div>
          <div className="the-lost-songs-song">
            <h4>Closing Remarks</h4>
            <p>
              I am changing and growing as a human. Having all of these songs
              sitting around felt wrong. I want people to be able to hear them
              while I move forward with my life and artistry. I am excited for
              what I have in store for you. See you soon on a new adventure!
            </p>
          </div>
        </div>
        <div className="the-lost-songs-map">
          <p>
            <em>
              “HEY GET THE FUCK OUT OF THE CAVE WHEN YER DUN! NO DILLY DALLYING
              I GOT GOLD TO FIND IN THESE HILLS AND IT WON&apos;T PAN ITSELF!
              Come again any time though! BYE!”
            </em>
            <br />
            <span>- Dark One</span>
          </p>
        </div>
      </div>
      <div className="soundcloud-player">
        <iframe
          title="soundcloud-player"
          width="100%"
          height="300"
          scrolling="no"
          frameborder="no"
          allow="autoplay"
          src={SOUNDCLOUD_PLAYER_URL}
        />
      </div>
    </>
  );
}
