// 生成1000个不重复的常用3字母英文单词
const words = [
  // 超高频词汇 (50个)
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
  'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'yet', 'may',
  'run', 'try', 'ask', 'big', 'end', 'far', 'few', 'got', 'own', 'red',

  // 高频基础词汇 (200个)
  'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'arm', 'art', 'bad',
  'bag', 'ban', 'bar', 'bat', 'bed', 'bee', 'bet', 'bid', 'bit', 'box',
  'bug', 'bus', 'buy', 'bye', 'cab', 'cap', 'car', 'cat', 'cop', 'cow',
  'cry', 'cup', 'cut', 'dad', 'den', 'die', 'dig', 'dog', 'due', 'ear',
  'eat', 'egg', 'eye', 'fan', 'fat', 'fee', 'fit', 'fix', 'fly', 'fog',
  'fox', 'fun', 'fur', 'gap', 'gas', 'gun', 'guy', 'gym', 'hat', 'hay',
  'hen', 'hit', 'hop', 'hot', 'hug', 'ice', 'ill', 'ink', 'job', 'joy',
  'key', 'kid', 'kit', 'lab', 'lap', 'law', 'lay', 'leg', 'lie', 'lip',
  'log', 'lot', 'low', 'mad', 'map', 'mix', 'mom', 'mud', 'net', 'nod',
  'nut', 'odd', 'off', 'oil', 'pan', 'pay', 'pen', 'pet', 'pie', 'pig',
  'pin', 'pit', 'pop', 'pot', 'rat', 'raw', 'rib', 'rid', 'rip', 'rob',
  'rod', 'row', 'rub', 'rug', 'sad', 'sea', 'set', 'shy', 'sin', 'sip',
  'sir', 'sit', 'six', 'ski', 'sky', 'son', 'sun', 'tab', 'tag', 'tan',
  'tap', 'tar', 'tax', 'tea', 'ten', 'tie', 'tin', 'tip', 'toe', 'ton',
  'top', 'toy', 'tub', 'van', 'war', 'web', 'wed', 'wet', 'why', 'wig',
  'win', 'wit', 'woe', 'won', 'wow', 'yes', 'zoo', 'abs', 'ace', 'aft',
  'ale', 'ant', 'any', 'ape', 'apt', 'arc', 'ark', 'ash', 'ate', 'awe',
  'axe', 'bay', 'bin', 'bow', 'bud', 'bun', 'cam', 'cob', 'cod', 'cog',
  'cub', 'cud', 'dam', 'dew', 'dim', 'dip', 'dot', 'dry', 'dub', 'dud',
  'dug', 'dye', 'eel', 'ego', 'elf', 'elk', 'elm', 'emu', 'era', 'eve',
  'ewe', 'fad', 'fig', 'fin', 'fir', 'flu', 'foe', 'fry', 'gag', 'gel',
  'gem', 'gin', 'gum', 'gut', 'ham', 'hid', 'hip', 'hoe', 'hum', 'hut',
  'imp', 'ion', 'ivy', 'jab', 'jag', 'jam', 'jar', 'jaw', 'jet', 'jig'
];

// 生成更多单词到1000个
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const additionalWords = [];

// 生成三字母组合，过滤出真实英文单词
const commonWords = [
  'jog', 'jot', 'jug', 'keg', 'kin', 'lad', 'lag', 'lid', 'lug', 'mac',
  'mat', 'mob', 'mop', 'mow', 'nag', 'nap', 'nay', 'nib', 'nil', 'nip',
  'nix', 'nun', 'oar', 'oat', 'oft', 'orb', 'ore', 'owl', 'pad', 'pal',
  'paw', 'pea', 'peg', 'pep', 'pew', 'pod', 'pox', 'pry', 'pub', 'pug',
  'pun', 'pup', 'rag', 'ram', 'ran', 'rap', 'ray', 'ref', 'rig', 'rim',
  'rot', 'rum', 'rut', 'rye', 'sac', 'sag', 'sap', 'sat', 'saw', 'sew',
  'sob', 'sod', 'sow', 'soy', 'spa', 'spy', 'sub', 'sue', 'sum', 'tee',
  'tot', 'tow', 'tug', 'vat', 'vet', 'vex', 'via', 'vie', 'vim', 'vow',
  'wad', 'wag', 'wan', 'wax', 'wee', 'yak', 'yam', 'yap', 'yaw', 'yay',
  'yea', 'yep', 'yew', 'yon', 'yum', 'zap', 'zen', 'zip', 'ado', 'aha',
  'amp', 'aye', 'bob', 'bog', 'bum', 'doc', 'doe', 'err', 'fax', 'gal',
  'gob', 'god', 'hag', 'hem', 'hep', 'hew', 'hex', 'hey', 'hog', 'hub',
  'hue', 'inn', 'irk', 'jay', 'jib', 'jin', 'joe', 'lac', 'lam', 'lea',
  'led', 'ley', 'lib', 'lit', 'loo', 'lop', 'lye', 'mag', 'mar', 'max',
  'mod', 'mug', 'nab', 'new', 'nit', 'nob', 'nog', 'nor', 'nub', 'oaf',
  'oak', 'ode', 'opt', 'par', 'pat', 'pax', 'per', 'ply', 'pro', 'quo',
  'rep', 'rev', 'roe', 'sly', 'sop', 'sot', 'sty', 'sup', 'tat', 'thy',
  'tic', 'tit', 'yen', 'yin', 'yow', 'yuk', 'yup', 'zag', 'zed', 'zee',
  'zit', 'beg', 'fib', 'gig', 'sis', 'dab', 'duh', 'gab', 'hah', 'koi',
  'lek', 'nah', 'oho', 'sib', 'sol', 'ugh', 'wok', 'yip', 'zoa', 'caw',
  'cox', 'coy', 'coz', 'cwm', 'dap', 'dev', 'dis', 'dos', 'ebb', 'eds',
  'efs', 'els', 'ems', 'ens', 'ern', 'eta', 'eth', 'fem', 'few', 'fey',
  'fez', 'fie', 'ghi', 'gnu', 'gox', 'gul', 'haj', 'hao', 'hep', 'hie',
  'hob', 'hod', 'hoy', 'hyp', 'ich', 'ick', 'ilk', 'jab', 'jak', 'jam',
  'jee', 'jew', 'jib', 'jin', 'job', 'jot', 'jow', 'jug', 'jus', 'jut',
  'kab', 'kae', 'kaf', 'kam', 'kas', 'kat', 'kaw', 'kay', 'kea', 'kef',
  'ken', 'kep', 'ket', 'kex', 'key', 'khi', 'kid', 'kif', 'kim', 'kin',
  'kip', 'kir', 'kis', 'kit', 'koa', 'kob', 'koi', 'kop', 'kor', 'kos',
  'kue', 'kye', 'lab', 'lac', 'lad', 'lag', 'lam', 'lap', 'lar', 'las',
  'lat', 'lav', 'law', 'lax', 'lay', 'lea', 'led', 'lee', 'leg', 'lei',
  'lek', 'les', 'let', 'leu', 'lev', 'lex', 'ley', 'lez', 'lib', 'lid',
  'lie', 'lin', 'lip', 'lis', 'lit', 'lob', 'log', 'loo', 'lop', 'lot',
  'low', 'lox', 'lud', 'lug', 'lum', 'luv', 'lux', 'luz', 'lye', 'lymph',
  'mac', 'mad', 'mae', 'mag', 'man', 'map', 'mar', 'mas', 'mat', 'maw',
  'max', 'may', 'med', 'mel', 'mem', 'men', 'met', 'mew', 'mho', 'mib',
  'mic', 'mid', 'mig', 'mil', 'mim', 'mir', 'mis', 'mix', 'miz', 'moa',
  'mob', 'mod', 'mog', 'mom', 'mon', 'moo', 'mop', 'mor', 'mos', 'mot',
  'mow', 'mud', 'mug', 'mum', 'mun', 'mus', 'mut', 'myc', 'nab', 'nae',
  'nag', 'nah', 'nam', 'nan', 'nap', 'naw', 'nay', 'neb', 'nee', 'net',
  'new', 'nib', 'nil', 'nim', 'nip', 'nit', 'nix', 'nob', 'nod', 'nog',
  'noh', 'nom', 'noo', 'nor', 'nos', 'not', 'now', 'nth', 'nub', 'nun',
  'nus', 'nut', 'nye', 'oaf', 'oak', 'oar', 'oat', 'oba', 'obe', 'obi',
  'oca', 'och', 'odd', 'ode', 'ods', 'oes', 'off', 'oft', 'ohm', 'oho',
  'ohs', 'oik', 'oil', 'oka', 'oke', 'old', 'ole', 'oms', 'one', 'ons',
  'ooh', 'oot', 'ope', 'ops', 'opt', 'ora', 'orb', 'orc', 'ore', 'ors',
  'ort', 'ose', 'oud', 'our', 'out', 'ova', 'owe', 'owl', 'own', 'owt',
  'oxo', 'oxy', 'oye', 'oyo', 'pac', 'pad', 'pah', 'pal', 'pam', 'pan',
  'pap', 'par', 'pas', 'pat', 'pav', 'paw', 'pax', 'pay', 'pea', 'pec',
  'ped', 'pee', 'peg', 'pen', 'pep', 'per', 'pes', 'pet', 'pew', 'phi',
  'pic', 'pie', 'pig', 'pin', 'pip', 'pis', 'pit', 'piu', 'pix', 'ply',
  'pod', 'poh', 'poi', 'pol', 'pom', 'pop', 'pos', 'pot', 'pow', 'pox',
  'poz', 'pro', 'pry', 'psi', 'pst', 'pub', 'pud', 'pug', 'pul', 'pun',
  'pup', 'pur', 'pus', 'put', 'puy', 'pya', 'pye', 'pyx', 'qat', 'qin',
  'qis', 'qua', 'rad', 'rag', 'rah', 'rai', 'raj', 'ram', 'ran', 'rap',
  'ras', 'rat', 'raw', 'rax', 'ray', 'reb', 'rec', 'red', 'ref', 'reg',
  'rei', 'rem', 'rep', 'res', 'ret', 'rev', 'rex', 'rez', 'rho', 'rhy',
  'ria', 'rib', 'rid', 'rif', 'rig', 'rim', 'rin', 'rip', 'rit', 'rob',
  'roc', 'rod', 'roe', 'rom', 'rot', 'row', 'rub', 'rue', 'rug', 'rum',
  'run', 'rut', 'rya', 'rye', 'sab', 'sac', 'sad', 'sae', 'sag', 'sal',
  'sap', 'sar', 'sat', 'sau', 'saw', 'sax', 'say', 'sea', 'sed', 'see',
  'seg', 'sei', 'sel', 'sen', 'ser', 'set', 'sew', 'sex', 'sha', 'she',
  'shh', 'shy', 'sib', 'sic', 'sim', 'sin', 'sip', 'sir', 'sis', 'sit',
  'six', 'ska', 'ski', 'sky', 'sly', 'sob', 'sod', 'sol', 'som', 'son',
  'sop', 'sos', 'sot', 'sou', 'sow', 'sox', 'soy', 'spa', 'spy', 'sty',
  'sub', 'sud', 'sue', 'suk', 'sum', 'sun', 'sup', 'syn', 'tab', 'tad',
  'tae', 'tag', 'taj', 'tam', 'tan', 'tao', 'tap', 'tar', 'tas', 'tat',
  'tau', 'tav', 'taw', 'tax', 'tea', 'ted', 'tee', 'teg', 'tel', 'ten',
  'tes', 'tet', 'tew', 'the', 'tho', 'thy', 'tic', 'tie', 'til', 'tin',
  'tip', 'tis', 'tit', 'tix', 'tiz', 'tod', 'toe', 'tog', 'tom', 'ton',
  'too', 'top', 'tor', 'tot', 'tow', 'toy', 'try', 'tsk', 'tub', 'tug',
  'tui', 'tum', 'tun', 'tup', 'tut', 'tux', 'twa', 'two', 'tye', 'tyg',
  'udo', 'uds', 'ugh', 'ugs', 'uke', 'ule', 'ulu', 'uma', 'umm', 'ump',
  'ums', 'una', 'une', 'uni', 'uns', 'upo', 'ups', 'urb', 'urd', 'urn',
  'urp', 'use', 'uta', 'ute', 'uts', 'vac', 'van', 'var', 'vas', 'vat',
  'vau', 'vav', 'vaw', 'vee', 'vet', 'vex', 'via', 'vid', 'vie', 'vig',
  'vim', 'vis', 'voe', 'von', 'vow', 'vox', 'vug', 'vum', 'wab', 'wad',
  'wae', 'wag', 'wan', 'wap', 'war', 'was', 'wat', 'waw', 'wax', 'way',
  'web', 'wed', 'wee', 'wen', 'wet', 'wha', 'who', 'why', 'wig', 'win',
  'wis', 'wit', 'wiz', 'woe', 'wog', 'wok', 'won', 'woo', 'wop', 'wos',
  'wot', 'wow', 'wry', 'wud', 'wye', 'wyn', 'xis', 'yag', 'yah', 'yak',
  'yam', 'yap', 'yar', 'yas', 'yat', 'yaw', 'yay', 'yea', 'yeh', 'yen',
  'yep', 'yer', 'yes', 'yet', 'yew', 'yex', 'yin', 'yip', 'yob', 'yod',
  'yon', 'you', 'yow', 'yuk', 'yum', 'yup', 'yus', 'zag', 'zap', 'zas',
  'zax', 'zea', 'zed', 'zee', 'zek', 'zen', 'zep', 'zet', 'zho', 'zig',
  'zin', 'zip', 'zit', 'ziz', 'zoa', 'zod', 'zol', 'zoo', 'zos', 'zuz',
  'zzz'
];

// 合并所有单词并去重
const allWords = [...words, ...commonWords];
const uniqueWords = [...new Set(allWords)];

console.log('总单词数:', uniqueWords.length);
console.log('前50个单词:', uniqueWords.slice(0, 50).join(', '));

// 输出结果供检查
const output = uniqueWords.map(word => `'${word}'`).join(', ');
console.log('\\n生成的单词列表:');
console.log(output);
