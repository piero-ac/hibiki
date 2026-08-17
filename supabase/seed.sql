insert into public.sentences (
  id,
  created_at,
  japanese_text,
  kana_text,
  english_translation,
  audio_prompt_url,
  jlpt_level,
  category,
  slow_audio_prompt_url
)
values
  (
    '06fdbfb8-3af7-41ae-a904-298b3e00a985',
    '2026-08-17 18:10:06.48528+00',
    '終電にぎりぎり間に合うと思って走ったんですが、ホームに着いた瞬間にドアが閉まってしまって、結局タクシーで帰ることになりました。',
    'しゅうでんにぎりぎりまにあうとおもってはしったんですが、ホームについたしゅんかんにドアがしまってしまって、けっきょくタクシーでかえることになりました。',
    'I ran because I thought I could just make the last train, but the doors closed the moment I reached the platform, so I ended up taking a taxi home.',
    'sentences/missing-last-train-home/natural.mp3',
    'N3',
    'Travel',
    'sentences/missing-last-train-home/slow.mp3'
  ),
  (
    '775a7f4d-8893-46db-84a3-64a1cfe7cebb',
    '2026-08-17 18:10:06.48528+00',
    '朝は晴れていたので傘を持たずに出かけたら、帰るころには土砂降りになっていて、駅から家までびしょ濡れで帰ることになりました。',
    'あさははれていたのでかさをもたずにでかけたら、かえるころにはどしゃぶりになっていて、えきからいえまでびしょぬれでかえることになりました。',
    'It was sunny in the morning, so I went out without an umbrella, but by the time I was heading home it was pouring, and I ended up getting soaked on the way from the station to my house.',
    'sentences/caught-in-rain-no-umbrella/natural.mp3',
    'N3',
    'Everyday Life',
    'sentences/caught-in-rain-no-umbrella/slow.mp3'
  ),
  (
    '2156360b-05ac-4ded-9f85-5056bc48a09c',
    '2026-08-17 18:10:06.48528+00',
    'ゼミの発表は毎回緊張するんですが、終わったあとに先生や友達から感想をもらうと、「次も頑張ろう」という気持ちになります。',
    'ゼミのはっぴょうはまいかいきんちょうするんですが、おわったあとにせんせいやともだちからかんそうをもらうと、「つぎもがんばろう」というきもちになります。',
    'I get nervous every time I give a presentation for my seminar, but when I receive feedback from my professor and friends afterward, it makes me want to do my best again next time.',
    'sentences/university-presentation/natural.mp3',
    'N3',
    'Work & School',
    'sentences/university-presentation/slow.mp3'
  );
