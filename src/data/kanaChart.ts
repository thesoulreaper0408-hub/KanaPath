import type { KanaChar } from '../types/learning';

export const HIRAGANA_CHARS: KanaChar[] = [
  // Vowels (a-row)
  { id: 'h-a', script: 'hiragana', char: 'あ', romaji: 'a', row: 'Vowels', mnemonic: 'Looks like an apple with a looping stem.', exampleWord: { kana: 'あい', romaji: 'ai', meaning: 'love' } },
  { id: 'h-i', script: 'hiragana', char: 'い', romaji: 'i', row: 'Vowels', mnemonic: 'Two eels swimming side by side.', exampleWord: { kana: 'いえ', romaji: 'ie', meaning: 'house' } },
  { id: 'h-u', script: 'hiragana', char: 'う', romaji: 'u', row: 'Vowels', mnemonic: 'A curved ear leaning forward to hear "oo".', exampleWord: { kana: 'うみ', romaji: 'umi', meaning: 'ocean' } },
  { id: 'h-e', script: 'hiragana', char: 'え', romaji: 'e', row: 'Vowels', mnemonic: 'An energetic runner mid-stride.', exampleWord: { kana: 'えき', romaji: 'eki', meaning: 'station' } },
  { id: 'h-o', script: 'hiragana', char: 'お', romaji: 'o', row: 'Vowels', mnemonic: 'A golf ball on a tee ("oh, nice shot!").', exampleWord: { kana: 'おちゃ', romaji: 'ocha', meaning: 'green tea' } },
  // K-row
  { id: 'h-ka', script: 'hiragana', char: 'か', romaji: 'ka', row: 'K-row', mnemonic: 'A blade cutting a stick — "ka!".', exampleWord: { kana: 'かさ', romaji: 'kasa', meaning: 'umbrella' } },
  { id: 'h-ki', script: 'hiragana', char: 'き', romaji: 'ki', row: 'K-row', mnemonic: 'Shaped like an old-fashioned key.', exampleWord: { kana: 'き', romaji: 'ki', meaning: 'tree' } },
  { id: 'h-ku', script: 'hiragana', char: 'く', romaji: 'ku', row: 'K-row', mnemonic: 'A cuckoo bird beak opening to sing "ku".', exampleWord: { kana: 'くち', romaji: 'kuchi', meaning: 'mouth' } },
  { id: 'h-ke', script: 'hiragana', char: 'け', romaji: 'ke', row: 'K-row', mnemonic: 'A wooden keg with two vertical staves.', exampleWord: { kana: 'けさ', romaji: 'kesa', meaning: 'this morning' } },
  { id: 'h-ko', script: 'hiragana', char: 'こ', romaji: 'ko', row: 'K-row', mnemonic: 'Two koi fish swimming in parallel.', exampleWord: { kana: 'ここ', romaji: 'koko', meaning: 'here' } },
  // S-row
  { id: 'h-sa', script: 'hiragana', char: 'さ', romaji: 'sa', row: 'S-row', mnemonic: 'A samurai sword held over a smile.', exampleWord: { kana: 'さかな', romaji: 'sakana', meaning: 'fish' } },
  { id: 'h-shi', script: 'hiragana', char: 'し', romaji: 'shi', row: 'S-row', mnemonic: 'A long curved fishing hook (she fishes).', exampleWord: { kana: 'しろ', romaji: 'shiro', meaning: 'white / castle' } },
  { id: 'h-su', script: 'hiragana', char: 'す', romaji: 'su', row: 'S-row', mnemonic: 'A curly swing hanging from a bar.', exampleWord: { kana: 'すし', romaji: 'sushi', meaning: 'sushi' } },
  { id: 'h-se', script: 'hiragana', char: 'せ', romaji: 'se', row: 'S-row', mnemonic: 'A mouth saying "seh!" with a tooth.', exampleWord: { kana: 'せかい', romaji: 'sekai', meaning: 'world' } },
  { id: 'h-so', script: 'hiragana', char: 'そ', romaji: 'so', row: 'S-row', mnemonic: 'A zigzag stitch when you sew fabric.', exampleWord: { kana: 'そら', romaji: 'sora', meaning: 'sky' } },
  // T-row
  { id: 'h-ta', script: 'hiragana', char: 'た', romaji: 'ta', row: 'T-row', mnemonic: 'Looks literally like the letters "t" and "a".', exampleWord: { kana: 'たべる', romaji: 'taberu', meaning: 'to eat' } },
  { id: 'h-chi', script: 'hiragana', char: 'ち', romaji: 'chi', row: 'T-row', mnemonic: 'Shaped like the number 5 — five cheerleaders.', exampleWord: { kana: 'ちず', romaji: 'chizu', meaning: 'map' } },
  { id: 'h-tsu', script: 'hiragana', char: 'つ', romaji: 'tsu', row: 'T-row', mnemonic: 'A curling ocean tsunami wave.', exampleWord: { kana: 'つき', romaji: 'tsuki', meaning: 'moon' } },
  { id: 'h-te', script: 'hiragana', char: 'て', romaji: 'te', row: 'T-row', mnemonic: 'A curved dog tail (or a palm of a hand, "te").', exampleWord: { kana: 'て', romaji: 'te', meaning: 'hand' } },
  { id: 'h-to', script: 'hiragana', char: 'と', romaji: 'to', row: 'T-row', mnemonic: 'A toe with a tiny splinter stuck in it.', exampleWord: { kana: 'とり', romaji: 'tori', meaning: 'bird' } },
  // N-row
  { id: 'h-na', script: 'hiragana', char: 'な', romaji: 'na', row: 'N-row', mnemonic: 'A knot tied with a cross above it.', exampleWord: { kana: 'なつ', romaji: 'natsu', meaning: 'summer' } },
  { id: 'h-ni', script: 'hiragana', char: 'に', romaji: 'ni', row: 'N-row', mnemonic: 'A needle next to two lines of thread.', exampleWord: { kana: 'にほん', romaji: 'nihon', meaning: 'Japan' } },
  { id: 'h-nu', script: 'hiragana', char: 'ぬ', romaji: 'nu', row: 'N-row', mnemonic: 'Tangled ramen noodles looping together.', exampleWord: { kana: 'いぬ', romaji: 'inu', meaning: 'dog' } },
  { id: 'h-ne', script: 'hiragana', char: 'ね', romaji: 'ne', row: 'N-row', mnemonic: 'A curled-up cat (neko) with a looping tail.', exampleWord: { kana: 'ねこ', romaji: 'neko', meaning: 'cat' } },
  { id: 'h-no', script: 'hiragana', char: 'の', romaji: 'no', row: 'N-row', mnemonic: 'A "No Entry" sign swirled into one stroke.', exampleWord: { kana: 'のむ', romaji: 'nomu', meaning: 'to drink' } },
  // H-row
  { id: 'h-ha', script: 'hiragana', char: 'は', romaji: 'ha', row: 'H-row', mnemonic: 'A cheerful person laughing "ha!".', exampleWord: { kana: 'はな', romaji: 'hana', meaning: 'flower' } },
  { id: 'h-hi', script: 'hiragana', char: 'ひ', romaji: 'hi', row: 'H-row', mnemonic: 'A wide smiling mouth giggling "hee-hee".', exampleWord: { kana: 'ひと', romaji: 'hito', meaning: 'person' } },
  { id: 'h-fu', script: 'hiragana', char: 'ふ', romaji: 'fu', row: 'H-row', mnemonic: 'Mount Fuji with wisps of cloud around it.', exampleWord: { kana: 'ふゆ', romaji: 'fuyu', meaning: 'winter' } },
  { id: 'h-he', script: 'hiragana', char: 'へ', romaji: 'he', row: 'H-row', mnemonic: 'A mountain ridge pointing up to heaven.', exampleWord: { kana: 'へや', romaji: 'heya', meaning: 'room' } },
  { id: 'h-ho', script: 'hiragana', char: 'ほ', romaji: 'ho', row: 'H-row', mnemonic: 'Like は (ha) wearing a double-barred hat ("ho!").', exampleWord: { kana: 'ほん', romaji: 'hon', meaning: 'book' } },
  // M-row
  { id: 'h-ma', script: 'hiragana', char: 'ま', romaji: 'ma', row: 'M-row', mnemonic: 'A ship mast with two yardarms.', exampleWord: { kana: 'まち', romaji: 'machi', meaning: 'town' } },
  { id: 'h-mi', script: 'hiragana', char: 'み', romaji: 'mi', row: 'M-row', mnemonic: 'Looks like the cursive number 21 ("me at 21").', exampleWord: { kana: 'みず', romaji: 'mizu', meaning: 'water' } },
  { id: 'h-mu', script: 'hiragana', char: 'む', romaji: 'mu', row: 'M-row', mnemonic: 'A cow face saying "moo".', exampleWord: { kana: 'むし', romaji: 'mushi', meaning: 'insect' } },
  { id: 'h-me', script: 'hiragana', char: 'め', romaji: 'me', row: 'M-row', mnemonic: 'An eye (me) without the tail loop of ぬ.', exampleWord: { kana: 'あめ', romaji: 'ame', meaning: 'rain' } },
  { id: 'h-mo', script: 'hiragana', char: 'も', romaji: 'mo', row: 'M-row', mnemonic: 'A fishing hook catching more worms.', exampleWord: { kana: 'もり', romaji: 'mori', meaning: 'forest' } },
  // Y-row
  { id: 'h-ya', script: 'hiragana', char: 'や', romaji: 'ya', row: 'Y-row', mnemonic: 'A yak head with curved horns.', exampleWord: { kana: 'やま', romaji: 'yama', meaning: 'mountain' } },
  { id: 'h-yu', script: 'hiragana', char: 'ゆ', romaji: 'yu', row: 'Y-row', mnemonic: 'A fish swimming in a hot spring (yu).', exampleWord: { kana: 'ゆき', romaji: 'yuki', meaning: 'snow' } },
  { id: 'h-yo', script: 'hiragana', char: 'よ', romaji: 'yo', row: 'Y-row', mnemonic: 'A hanging yo-yo on a string.', exampleWord: { kana: 'よる', romaji: 'yoru', meaning: 'night' } },
  // R-row
  { id: 'h-ra', script: 'hiragana', char: 'ら', romaji: 'ra', row: 'R-row', mnemonic: 'A rabbit sitting with drooping ears.', exampleWord: { kana: 'らく', romaji: 'raku', meaning: 'comfortable' } },
  { id: 'h-ri', script: 'hiragana', char: 'り', romaji: 'ri', row: 'R-row', mnemonic: 'Two tall reeds growing by a river.', exampleWord: { kana: 'りんご', romaji: 'ringo', meaning: 'apple' } },
  { id: 'h-ru', script: 'hiragana', char: 'る', romaji: 'ru', row: 'R-row', mnemonic: 'A 3 holding a ruby in its bottom loop.', exampleWord: { kana: 'はる', romaji: 'haru', meaning: 'spring' } },
  { id: 'h-re', script: 'hiragana', char: 'れ', romaji: 're', row: 'R-row', mnemonic: 'A reindeer bowing with antlers.', exampleWord: { kana: 'これ', romaji: 'kore', meaning: 'this' } },
  { id: 'h-ro', script: 'hiragana', char: 'ろ', romaji: 'ro', row: 'R-row', mnemonic: 'A 3 without the ruby (robbed of its gem).', exampleWord: { kana: 'ろく', romaji: 'roku', meaning: 'six' } },
  // W-row & N
  { id: 'h-wa', script: 'hiragana', char: 'わ', romaji: 'wa', row: 'W / N', mnemonic: 'A graceful swan curving its neck over water.', exampleWord: { kana: 'わたし', romaji: 'watashi', meaning: 'I / me' } },
  { id: 'h-wo', script: 'hiragana', char: 'を', romaji: 'wo', row: 'W / N', mnemonic: 'A surfer riding a big wave ("whoa!"). Used as object particle.', exampleWord: { kana: 'みずをのむ', romaji: 'mizu wo nomu', meaning: 'drink water' } },
  { id: 'h-n', script: 'hiragana', char: 'ん', romaji: 'n', row: 'W / N', mnemonic: 'Looks just like a cursive lowercase "n".', exampleWord: { kana: 'にほん', romaji: 'nihon', meaning: 'Japan' } },
];

export const KATAKANA_CHARS: KanaChar[] = [
  // Vowels
  { id: 'k-a', script: 'katakana', char: 'ア', romaji: 'a', row: 'Vowels', mnemonic: 'An angular axe head.', exampleWord: { kana: 'アイス', romaji: 'aisu', meaning: 'ice cream' } },
  { id: 'k-i', script: 'katakana', char: 'イ', romaji: 'i', row: 'Vowels', mnemonic: 'An easel standing upright.', exampleWord: { kana: 'インド', romaji: 'indo', meaning: 'India' } },
  { id: 'k-u', script: 'katakana', char: 'ウ', romaji: 'u', row: 'Vowels', mnemonic: 'A sharp angular version of hiragana う.', exampleWord: { kana: 'ウール', romaji: 'uuru', meaning: 'wool' } },
  { id: 'k-e', script: 'katakana', char: 'エ', romaji: 'e', row: 'Vowels', mnemonic: 'An elevator shaft or wide capital I.', exampleWord: { kana: 'エアコン', romaji: 'eakon', meaning: 'air conditioner' } },
  { id: 'k-o', script: 'katakana', char: 'オ', romaji: 'o', row: 'Vowels', mnemonic: 'An opera singer raising arms in song.', exampleWord: { kana: 'オレンジ', romaji: 'orenji', meaning: 'orange' } },
  // K-row
  { id: 'k-ka', script: 'katakana', char: 'カ', romaji: 'ka', row: 'K-row', mnemonic: 'Angular twin of hiragana か without the extra drop.', exampleWord: { kana: 'カメラ', romaji: 'kamera', meaning: 'camera' } },
  { id: 'k-ki', script: 'katakana', char: 'キ', romaji: 'ki', row: 'K-row', mnemonic: 'The top half of a skeleton key (き).', exampleWord: { kana: 'キロ', romaji: 'kiro', meaning: 'kilogram' } },
  { id: 'k-ku', script: 'katakana', char: 'ク', romaji: 'ku', row: 'K-row', mnemonic: 'A cook’s tall slanted hat.', exampleWord: { kana: 'クラス', romaji: 'kurasu', meaning: 'class' } },
  { id: 'k-ke', script: 'katakana', char: 'ケ', romaji: 'ke', row: 'K-row', mnemonic: 'A leaning letter K.', exampleWord: { kana: 'ケーキ', romaji: 'keeki', meaning: 'cake' } },
  { id: 'k-ko', script: 'katakana', char: 'コ', romaji: 'ko', row: 'K-row', mnemonic: 'Two sharp corners of a box.', exampleWord: { kana: 'コーヒー', romaji: 'koohii', meaning: 'coffee' } },
  // S-row
  { id: 'k-sa', script: 'katakana', char: 'サ', romaji: 'sa', row: 'S-row', mnemonic: 'A saddle resting on a rail.', exampleWord: { kana: 'サラダ', romaji: 'sarada', meaning: 'salad' } },
  { id: 'k-shi', script: 'katakana', char: 'シ', romaji: 'shi', row: 'S-row', mnemonic: 'She smiles upward — strokes tilt horizontally.', exampleWord: { kana: 'シャツ', romaji: 'shatsu', meaning: 'shirt' } },
  { id: 'k-su', script: 'katakana', char: 'ス', romaji: 'su', row: 'S-row', mnemonic: 'A skier speeding down a super slope.', exampleWord: { kana: 'スープ', romaji: 'suupu', meaning: 'soup' } },
  { id: 'k-se', script: 'katakana', char: 'セ', romaji: 'se', row: 'S-row', mnemonic: 'Sharper cornered version of hiragana せ.', exampleWord: { kana: 'セーター', romaji: 'seetaa', meaning: 'sweater' } },
  { id: 'k-so', script: 'katakana', char: 'ソ', romaji: 'so', row: 'S-row', mnemonic: 'One short stroke + steep downward sweep (needle & thread).', exampleWord: { kana: 'ソファ', romaji: 'sofa', meaning: 'sofa' } },
  // T-row
  { id: 'k-ta', script: 'katakana', char: 'タ', romaji: 'ta', row: 'T-row', mnemonic: 'A folded taco with filling inside.', exampleWord: { kana: 'タクシー', romaji: 'takushii', meaning: 'taxi' } },
  { id: 'k-chi', script: 'katakana', char: 'チ', romaji: 'chi', row: 'T-row', mnemonic: 'A cheerleader doing a high kick.', exampleWord: { kana: 'チーズ', romaji: 'chiizu', meaning: 'cheese' } },
  { id: 'k-tsu', script: 'katakana', char: 'ツ', romaji: 'tsu', row: 'T-row', mnemonic: 'Two vertical raindrops falling down.', exampleWord: { kana: 'ツアー', romaji: 'tsuaa', meaning: 'tour' } },
  { id: 'k-te', script: 'katakana', char: 'テ', romaji: 'te', row: 'T-row', mnemonic: 'A telephone pole with two crossbars.', exampleWord: { kana: 'テレビ', romaji: 'terebi', meaning: 'television' } },
  { id: 'k-to', script: 'katakana', char: 'ト', romaji: 'to', row: 'T-row', mnemonic: 'A totem pole with a carved beak.', exampleWord: { kana: 'トマト', romaji: 'tomato', meaning: 'tomato' } },
  // N-row
  { id: 'k-na', script: 'katakana', char: 'ナ', romaji: 'na', row: 'N-row', mnemonic: 'A narwhal tusk crossing a wave.', exampleWord: { kana: 'ナイフ', romaji: 'naifu', meaning: 'knife' } },
  { id: 'k-ni', script: 'katakana', char: 'ニ', romaji: 'ni', row: 'N-row', mnemonic: 'Two parallel lines — also the Kanji for two (二, ni)!', exampleWord: { kana: 'ニュース', romaji: 'nyuusu', meaning: 'news' } },
  { id: 'k-nu', script: 'katakana', char: 'ヌ', romaji: 'nu', row: 'N-row', mnemonic: 'Chopsticks picking up noodles.', exampleWord: { kana: 'カヌー', romaji: 'kanuu', meaning: 'canoe' } },
  { id: 'k-ne', script: 'katakana', char: 'ネ', romaji: 'ne', row: 'N-row', mnemonic: 'A bird nest perched in branches.', exampleWord: { kana: 'ネクタイ', romaji: 'nekutai', meaning: 'necktie' } },
  { id: 'k-no', script: 'katakana', char: 'ノ', romaji: 'no', row: 'N-row', mnemonic: 'A single diagonal slash ("no!").', exampleWord: { kana: 'ノート', romaji: 'nooto', meaning: 'notebook' } },
  // H-row
  { id: 'k-ha', script: 'katakana', char: 'ハ', romaji: 'ha', row: 'H-row', mnemonic: 'Two angled walls of a house.', exampleWord: { kana: 'ハム', romaji: 'hamu', meaning: 'ham' } },
  { id: 'k-hi', script: 'katakana', char: 'ヒ', romaji: 'hi', row: 'H-row', mnemonic: 'A high heel shoe profile.', exampleWord: { kana: 'ヒント', romaji: 'hinto', meaning: 'hint' } },
  { id: 'k-fu', script: 'katakana', char: 'フ', romaji: 'fu', row: 'H-row', mnemonic: 'A triangular flag flapping in wind.', exampleWord: { kana: 'フルーツ', romaji: 'furuutsu', meaning: 'fruit' } },
  { id: 'k-he', script: 'katakana', char: 'ヘ', romaji: 'he', row: 'H-row', mnemonic: 'Identical peak shape to hiragana へ.', exampleWord: { kana: 'ヘルメット', romaji: 'herumetto', meaning: 'helmet' } },
  { id: 'k-ho', script: 'katakana', char: 'ホ', romaji: 'ho', row: 'H-row', mnemonic: 'A holy cross with two rays.', exampleWord: { kana: 'ホテル', romaji: 'hoteru', meaning: 'hotel' } },
  // M-row
  { id: 'k-ma', script: 'katakana', char: 'マ', romaji: 'ma', row: 'M-row', mnemonic: 'A geometric manta ray wing.', exampleWord: { kana: 'マップ', romaji: 'mappu', meaning: 'map' } },
  { id: 'k-mi', script: 'katakana', char: 'ミ', romaji: 'mi', row: 'M-row', mnemonic: 'Three slanted missiles flying together.', exampleWord: { kana: 'ミルク', romaji: 'miruku', meaning: 'milk' } },
  { id: 'k-mu', script: 'katakana', char: 'ム', romaji: 'mu', row: 'M-row', mnemonic: 'A bent elbow flexing muscle.', exampleWord: { kana: 'チーム', romaji: 'chiimu', meaning: 'team' } },
  { id: 'k-me', script: 'katakana', char: 'メ', romaji: 'me', row: 'M-row', mnemonic: 'An X marking a map spot (remember me).', exampleWord: { kana: 'メニュー', romaji: 'menyuu', meaning: 'menu' } },
  { id: 'k-mo', script: 'katakana', char: 'モ', romaji: 'mo', row: 'M-row', mnemonic: 'Angular cousin of hiragana も.', exampleWord: { kana: 'モデル', romaji: 'moderu', meaning: 'model' } },
  // Y-row
  { id: 'k-ya', script: 'katakana', char: 'ヤ', romaji: 'ya', row: 'Y-row', mnemonic: 'Crisp angular cousin of hiragana や.', exampleWord: { kana: 'ヤシ', romaji: 'yashi', meaning: 'palm tree' } },
  { id: 'k-yu', script: 'katakana', char: 'ユ', romaji: 'yu', row: 'Y-row', mnemonic: 'A U-boat periscope on the water line.', exampleWord: { kana: 'ユニーク', romaji: 'yuniiku', meaning: 'unique' } },
  { id: 'k-yo', script: 'katakana', char: 'ヨ', romaji: 'yo', row: 'Y-row', mnemonic: 'A backwards letter E — yell "Yo!".', exampleWord: { kana: 'ヨーグルト', romaji: 'yooguruto', meaning: 'yogurt' } },
  // R-row
  { id: 'k-ra', script: 'katakana', char: 'ラ', romaji: 'ra', row: 'R-row', mnemonic: 'A rocking chair seen from the side.', exampleWord: { kana: 'ラーメン', romaji: 'raamen', meaning: 'ramen' } },
  { id: 'k-ri', script: 'katakana', char: 'リ', romaji: 'ri', row: 'R-row', mnemonic: 'Two reeds, crisp and straight like hiragana り.', exampleWord: { kana: 'リスト', romaji: 'risuto', meaning: 'list' } },
  { id: 'k-ru', script: 'katakana', char: 'ル', romaji: 'ru', row: 'R-row', mnemonic: 'Two tree roots branching down.', exampleWord: { kana: 'ルール', romaji: 'ruuru', meaning: 'rule' } },
  { id: 'k-re', script: 'katakana', char: 'レ', romaji: 're', row: 'R-row', mnemonic: 'A razor sharp check mark.', exampleWord: { kana: 'レモン', romaji: 'remon', meaning: 'lemon' } },
  { id: 'k-ro', script: 'katakana', char: 'ロ', romaji: 'ro', row: 'R-row', mnemonic: 'A square robot mouth.', exampleWord: { kana: 'ロボット', romaji: 'robotto', meaning: 'robot' } },
  // W-row & N
  { id: 'k-wa', script: 'katakana', char: 'ワ', romaji: 'wa', row: 'W / N', mnemonic: 'A wide wine glass rim.', exampleWord: { kana: 'ワイン', romaji: 'wain', meaning: 'wine' } },
  { id: 'k-wo', script: 'katakana', char: 'ヲ', romaji: 'wo', row: 'W / N', mnemonic: 'Rarely used in modern loanwords, mirrors hiragana を.', exampleWord: { kana: 'ヲタク', romaji: 'wotaku', meaning: 'enthusiast' } },
  { id: 'k-n', script: 'katakana', char: 'ン', romaji: 'n', row: 'W / N', mnemonic: 'One dot and an upward scoop (like シ, but only 1 dot).', exampleWord: { kana: 'パン', romaji: 'pan', meaning: 'bread' } },
];
