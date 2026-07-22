export type Card = {
  slug: string;
  nameEn: string;
  arcana: "major" | "minor";
  suit: "cups" | "wands" | "swords" | "pentacles" | null;
  number: number;
  image: string;
  en: { description: string };
};

export const cards: Card[] = [
  {
    slug: "the-fool",
    nameEn: "The Fool",
    arcana: "major",
    suit: null,
    number: 0,
    image: "/tarotdeck/thefool.jpeg",
    en: {
      description:
        "The Fool represents new beginnings, fresh starts, and stepping into the unknown with an open heart. It speaks of innocence, spontaneity, and a willingness to take a leap of faith without knowing exactly where the path leads.\n\nThis card invites you to trust the journey ahead, embrace curiosity, and welcome unexpected opportunities. While it carries the spirit of adventure, it also gently reminds you to stay aware of your surroundings and to learn from each step you take.",
    },
  },
  {
    slug: "the-magician",
    nameEn: "The Magician",
    arcana: "major",
    suit: null,
    number: 1,
    image: "/tarotdeck/themagician.jpeg",
    en: {
      description:
        "The Magician symbolises focused intention, skill, and the ability to turn ideas into reality. It represents someone who has all the tools they need and the awareness to use them with purpose.\n\nWhen this card appears, it suggests that your willpower, creativity, and clarity of thought are aligned. It encourages you to act with confidence, communicate clearly, and trust that what you envision can be brought into form through deliberate effort.",
    },
  },
  {
    slug: "the-high-priestess",
    nameEn: "The High Priestess",
    arcana: "major",
    suit: null,
    number: 2,
    image: "/tarotdeck/thehighpriestess.jpeg",
    en: {
      description:
        "The High Priestess represents intuition, inner wisdom, and the quiet voice that speaks beneath the noise of daily life. She is the keeper of mysteries, secrets, and knowledge that cannot always be put into words.\n\nWhen she appears, she invites you to slow down, listen inward, and trust what you sense rather than what you can prove. This is a card of reflection, dreams, and the subtle truths that reveal themselves only when you give them space.",
    },
  },
  {
    slug: "the-empress",
    nameEn: "The Empress",
    arcana: "major",
    suit: null,
    number: 3,
    image: "/tarotdeck/theempress.jpeg",
    en: {
      description:
        "The Empress embodies abundance, nurturing energy, and the creative force that brings ideas and life into being. She is connected to nature, beauty, sensuality, and the comfort of being deeply cared for.\n\nThis card encourages you to tend to what you have planted, whether that is a relationship, a project, or your own well being. It speaks of growth that unfolds naturally when given warmth, patience, and attention.",
    },
  },
  {
    slug: "the-emperor",
    nameEn: "The Emperor",
    arcana: "major",
    suit: null,
    number: 4,
    image: "/tarotdeck/theemperor.jpeg",
    en: {
      description:
        "The Emperor stands for structure, authority, and the steady hand of leadership. He represents the part of us that builds foundations, sets boundaries, and creates order out of chaos.\n\nWhen this card appears, it suggests that discipline, planning, and clear principles will serve you well. It invites you to take responsibility, lead with fairness, and protect what you have built through consistent effort and sound judgement.",
    },
  },
  {
    slug: "the-hierophant",
    nameEn: "The Hierophant",
    arcana: "major",
    suit: null,
    number: 5,
    image: "/tarotdeck/thehierophant.jpeg",
    en: {
      description:
        "The Hierophant represents tradition, shared belief, and the wisdom passed down through institutions, teachers, and communities. He speaks of mentorship, learning, and the value of established paths.\n\nThis card may suggest that guidance from a respected source, a study of the familiar, or a return to your roots could offer clarity right now. It honours ritual, ceremony, and the meaning we draw from belonging to something larger than ourselves.",
    },
  },
  {
    slug: "the-lovers",
    nameEn: "The Lovers",
    arcana: "major",
    suit: null,
    number: 6,
    image: "/tarotdeck/TheLovers.jpg",
    en: {
      description:
        "The Lovers represent meaningful connection, conscious choice, and the union of opposites into something whole. While often linked with romantic love, this card more broadly speaks of values, commitments, and the alignment of heart and mind.\n\nIt invites you to consider what truly matters to you and to choose with honesty. Whether facing a relationship, a decision, or a crossroads, this card asks that you stay true to your inner compass.",
    },
  },
  {
    slug: "the-chariot",
    nameEn: "The Chariot",
    arcana: "major",
    suit: null,
    number: 7,
    image: "/tarotdeck/thechariot.jpeg",
    en: {
      description:
        "The Chariot represents determination, focus, and the drive to move forward in spite of obstacles. It speaks of victory earned through self discipline and the ability to hold steady when forces pull in different directions.\n\nWhen this card appears, it encourages you to take the reins, set a clear direction, and trust your strength. Progress is possible when you stay committed to your goal and refuse to be thrown off course.",
    },
  },
  {
    slug: "strength",
    nameEn: "Strength",
    arcana: "major",
    suit: null,
    number: 8,
    image: "/tarotdeck/thestrength.jpeg",
    en: {
      description:
        "Strength represents quiet courage, patience, and the gentle power that comes from inner balance rather than force. It is the calm that tames the wild, the steady hand that meets difficulty with compassion.\n\nThis card reminds you that true strength is not loud or aggressive. It is the resilience to keep going, the kindness to handle yourself well under pressure, and the trust that softness and power can coexist.",
    },
  },
  {
    slug: "the-hermit",
    nameEn: "The Hermit",
    arcana: "major",
    suit: null,
    number: 9,
    image: "/tarotdeck/thehermit.jpeg",
    en: {
      description:
        "The Hermit represents solitude, introspection, and the search for meaning within. He carries a lantern that lights only the next step, reminding us that wisdom is found in stillness as much as in movement.\n\nWhen this card appears, it invites you to step back from the noise, reflect on your path, and listen to what you already know. Time spent alone with your thoughts may bring the clarity that the outside world cannot give.",
    },
  },
  {
    slug: "wheel-of-fortune",
    nameEn: "Wheel of Fortune",
    arcana: "major",
    suit: null,
    number: 10,
    image: "/tarotdeck/wheeloffortune.jpeg",
    en: {
      description:
        "The Wheel of Fortune represents the turning of cycles, the rhythm of change, and the moments when life shifts in unexpected ways. It speaks of fortune, fate, and the larger patterns at work beneath our daily choices.\n\nThis card reminds you that nothing stays the same forever. When things feel difficult, change is coming. When things feel easy, savour it. Stay grounded through the turns and trust that the wheel keeps moving.",
    },
  },
  {
    slug: "justice",
    nameEn: "Justice",
    arcana: "major",
    suit: null,
    number: 11,
    image: "/tarotdeck/justice.jpeg",
    en: {
      description:
        "Justice represents fairness, truth, and the natural consequences of our actions. It speaks to the importance of honesty, accountability, and seeing situations clearly without bias.\n\nWhen this card appears, it asks you to weigh matters carefully, act with integrity, and accept the results of past decisions. Balance is restored not by avoiding difficulty but by meeting it with clarity and a willingness to make things right.",
    },
  },
  {
    slug: "the-hanged-man",
    nameEn: "The Hanged Man",
    arcana: "major",
    suit: null,
    number: 12,
    image: "/tarotdeck/thehangedman.jpeg",
    en: {
      description:
        "The Hanged Man represents pause, surrender, and the new perspective that comes when you stop struggling against the moment. It speaks of letting go, suspending judgement, and seeing things from a different angle.\n\nThis card suggests that waiting is not the same as losing. Sometimes insight arrives only when you release control. Allow yourself to be still, observe, and trust that this pause has its own purpose.",
    },
  },
  {
    slug: "death",
    nameEn: "Death",
    arcana: "major",
    suit: null,
    number: 13,
    image: "/tarotdeck/death.jpeg",
    en: {
      description:
        "Death rarely refers to a literal ending. It represents transformation, the closing of one chapter so another can begin, and the natural release of what no longer serves you.\n\nWhen this card appears, it invites you to let go with grace. Endings can feel uncomfortable, but they clear space for renewal. Trust that what falls away is making room for something more aligned with who you are becoming.",
    },
  },
  {
    slug: "temperance",
    nameEn: "Temperance",
    arcana: "major",
    suit: null,
    number: 14,
    image: "/tarotdeck/temperance.jpeg",
    en: {
      description:
        "Temperance represents balance, moderation, and the patient blending of opposites into harmony. It speaks of measured action, calm timing, and the art of finding the middle path.\n\nThis card encourages you to breathe, take your time, and bring different parts of your life into balance. Healing and steady progress come not through extremes but through gentle, consistent care.",
    },
  },
  {
    slug: "the-devil",
    nameEn: "The Devil",
    arcana: "major",
    suit: null,
    number: 15,
    image: "/tarotdeck/thedevil.jpeg",
    en: {
      description:
        "The Devil represents attachment, illusion, and the patterns that keep us bound when freedom is closer than we think. It speaks of habits, fears, or beliefs that feel inescapable but are often of our own making.\n\nWhen this card appears, it asks you to look honestly at what holds you back. The chains in this image are loose. Awareness is the first step toward releasing what limits you and reclaiming your power.",
    },
  },
  {
    slug: "the-tower",
    nameEn: "The Tower",
    arcana: "major",
    suit: null,
    number: 16,
    image: "/tarotdeck/thetower.jpeg",
    en: {
      description:
        "The Tower represents sudden change, the collapse of structures built on shaky ground, and the revelations that come when illusions fall away. It can feel disruptive, but it clears the way for something more honest.\n\nThis card reminds you that what is built on truth will stand. What crumbles needed to fall. Even in upheaval, there is freedom in seeing things as they really are.",
    },
  },
  {
    slug: "the-star",
    nameEn: "The Star",
    arcana: "major",
    suit: null,
    number: 17,
    image: "/tarotdeck/thestar.jpeg",
    en: {
      description:
        "The Star represents hope, renewal, and the quiet faith that returns after a difficult passage. It is the soft light that appears once the storm has passed, reminding you that healing is possible.\n\nWhen this card appears, it invites you to trust again, to dream, and to reconnect with what inspires you. There is calm here, and a sense that you are exactly where you need to be.",
    },
  },
  {
    slug: "the-moon",
    nameEn: "The Moon",
    arcana: "major",
    suit: null,
    number: 18,
    image: "/tarotdeck/themoon.jpeg",
    en: {
      description:
        "The Moon represents what has not yet come into focus, the realm where intuition and dreams move ahead of reason. This is not always a time to trust things exactly as they appear — shadows loom larger than they are in the fog, and there can be real distance between how a situation looks and what is actually happening.\n\nHonour your feelings, but hold off on quick conclusions. Question what you see one more time, and take small, reversible steps until the picture clears. Even in the mist, this way you do not lose the path.",
    },
  },
  {
    slug: "the-sun",
    nameEn: "The Sun",
    arcana: "major",
    suit: null,
    number: 19,
    image: "/tarotdeck/thesun.jpeg",
    en: {
      description:
        "The Sun represents joy, clarity, and the warmth of life lived openly. It is the card of celebration, vitality, and the simple happiness of being fully present.\n\nWhen this card appears, it brings encouragement. Whatever you are working on, the light is on your side. Allow yourself to feel optimism, share your warmth with others, and enjoy the moment without holding back.",
    },
  },
  {
    slug: "judgement",
    nameEn: "Judgement",
    arcana: "major",
    suit: null,
    number: 20,
    image: "/tarotdeck/judgement.jpeg",
    en: {
      description:
        "Judgement represents awakening, reflection, and the call to step into a truer version of yourself. It speaks of the moments when you see the past clearly and feel ready to move forward with new understanding.\n\nThis card asks you to listen to the inner voice that knows what needs to change. Forgive what needs forgiving, release what is finished, and answer the call to live more honestly.",
    },
  },
  {
    slug: "the-world",
    nameEn: "The World",
    arcana: "major",
    suit: null,
    number: 21,
    image: "/tarotdeck/theworld.jpeg",
    en: {
      description:
        "The World represents completion, wholeness, and the satisfying close of a meaningful cycle. It is the card of accomplishment, integration, and the quiet pride of seeing something through.\n\nWhen this card appears, it honours the journey you have taken. Pause to recognise how far you have come. A chapter is ending well, and a new one is preparing to begin.",
    },
  },
  {
    slug: "ace-of-cups",
    nameEn: "Ace of Cups",
    arcana: "minor",
    suit: "cups",
    number: 1,
    image: "/tarotdeck/aceofcups.jpeg",
    en: {
      description:
        "The Ace of Cups represents the beginning of emotional flow, new love, and the opening of the heart. It is a card of fresh feelings, creative inspiration, and connection that arrives without warning.\n\nWhen this card appears, it invites you to receive what is being offered. Allow yourself to feel deeply, express what stirs within you, and welcome the warmth that is making its way toward you.",
    },
  },
  {
    slug: "two-of-cups",
    nameEn: "Two of Cups",
    arcana: "minor",
    suit: "cups",
    number: 2,
    image: "/tarotdeck/twoofcups.jpeg",
    en: {
      description:
        "The Two of Cups represents partnership, mutual respect, and the meeting of two hearts in shared understanding. It speaks of harmony, attraction, and the warmth that flows between people who truly see each other.\n\nThis card may point to a budding friendship, a meaningful conversation, or a relationship deepening in trust. It reminds you that connection is built through openness and a willingness to meet others as equals.",
    },
  },
  {
    slug: "three-of-cups",
    nameEn: "Three of Cups",
    arcana: "minor",
    suit: "cups",
    number: 3,
    image: "/tarotdeck/threeofcups.jpeg",
    en: {
      description:
        "The Three of Cups represents celebration, friendship, and the joy that comes from shared moments. It is a card of community, gatherings, and the simple delight of being among people who care for you.\n\nWhen this card appears, it invites you to spend time with those who lift your spirits. Whether marking a milestone or simply enjoying good company, there is happiness to be found in togetherness.",
    },
  },
  {
    slug: "four-of-cups",
    nameEn: "Four of Cups",
    arcana: "minor",
    suit: "cups",
    number: 4,
    image: "/tarotdeck/fourofcups.jpeg",
    en: {
      description:
        "The Four of Cups represents introspection, restlessness, and the feeling of being uninspired by what is in front of you. It speaks of moments when you sense something is missing, even when blessings are within reach.\n\nThis card invites you to look up. An opportunity may be quietly waiting, but you have to notice it. Reflect on what you truly want and consider whether what you are overlooking might be exactly what you need.",
    },
  },
  {
    slug: "five-of-cups",
    nameEn: "Five of Cups",
    arcana: "minor",
    suit: "cups",
    number: 5,
    image: "/tarotdeck/fiveofcups.jpeg",
    en: {
      description:
        "The Five of Cups represents grief, disappointment, and the weight of focusing on what has been lost. It honours the sadness that comes when things do not turn out as hoped.\n\nThis card also reminds you that not everything is gone. Two cups still stand. When you are ready, gently turn your attention to what remains. Healing begins when you allow yourself to feel, and then choose to look forward.",
    },
  },
  {
    slug: "six-of-cups",
    nameEn: "Six of Cups",
    arcana: "minor",
    suit: "cups",
    number: 6,
    image: "/tarotdeck/sixofcups.jpeg",
    en: {
      description:
        "The Six of Cups represents memory, nostalgia, and the sweetness of returning to something familiar. It speaks of childhood, old friendships, and the comfort of simpler times.\n\nWhen this card appears, it invites you to draw warmth from your past without becoming stuck in it. Reconnect with what once made you happy, share kindness freely, and let innocent joy find its way back into your days.",
    },
  },
  {
    slug: "seven-of-cups",
    nameEn: "Seven of Cups",
    arcana: "minor",
    suit: "cups",
    number: 7,
    image: "/tarotdeck/sevenofcups.jpeg",
    en: {
      description:
        "The Seven of Cups represents choices, daydreams, and the many possibilities that can feel overwhelming when laid before you. It speaks of imagination, but also of the risk of getting lost in fantasy.\n\nThis card asks you to look clearly at what is real and what is wishful thinking. Bring your dreams down to earth, choose with care, and remember that not every cup holds what it appears to.",
    },
  },
  {
    slug: "eight-of-cups",
    nameEn: "Eight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 8,
    image: "/tarotdeck/eightofcups.jpeg",
    en: {
      description:
        "The Eight of Cups represents walking away, letting go of what no longer fulfils you, and seeking something more meaningful. It speaks of quiet courage and the wisdom to leave behind what once seemed important.\n\nWhen this card appears, it suggests that something within you is ready for change. Trust the pull toward what feels truer, even if it means leaving the familiar behind.",
    },
  },
  {
    slug: "nine-of-cups",
    nameEn: "Nine of Cups",
    arcana: "minor",
    suit: "cups",
    number: 9,
    image: "/tarotdeck/nineofcups.jpeg",
    en: {
      description:
        "The Nine of Cups represents contentment, satisfaction, and the quiet joy of seeing your wishes come true. It is often called the wish card, a sign of emotional fulfilment and gratitude.\n\nThis card invites you to enjoy what you have created and to appreciate the comforts around you. Allow yourself to feel proud, share your happiness, and recognise the abundance already in your life.",
    },
  },
  {
    slug: "ten-of-cups",
    nameEn: "Ten of Cups",
    arcana: "minor",
    suit: "cups",
    number: 10,
    image: "/tarotdeck/tenofcups.jpeg",
    en: {
      description:
        "The Ten of Cups represents emotional harmony, family, and the lasting happiness that comes from love freely shared. It speaks of peace at home, deep bonds, and a sense of belonging.\n\nWhen this card appears, it honours the connections you have nurtured. Take a moment to be present with those you love and to recognise the quiet beauty of a life built on care.",
    },
  },
  {
    slug: "page-of-cups",
    nameEn: "Page of Cups",
    arcana: "minor",
    suit: "cups",
    number: 11,
    image: "/tarotdeck/pageofcups.jpeg",
    en: {
      description:
        "The Page of Cups represents creative inspiration, gentle curiosity, and messages that touch the heart. This figure is open, imaginative, and unafraid to feel.\n\nWhen this card appears, it invites you to approach life with wonder. A surprising idea, an unexpected message, or a tender feeling may be making its way to you. Receive it with an open mind.",
    },
  },
  {
    slug: "knight-of-cups",
    nameEn: "Knight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 12,
    image: "/tarotdeck/knightofcups.jpeg",
    en: {
      description:
        "The Knight of Cups represents romance, idealism, and the pursuit of something meaningful. This figure follows the heart, offering gestures with sincerity and grace.\n\nThis card may signal an invitation, a creative offer, or the arrival of someone or something that stirs your emotions. Move toward what calls you, but stay grounded enough to see things as they truly are.",
    },
  },
  {
    slug: "queen-of-cups",
    nameEn: "Queen of Cups",
    arcana: "minor",
    suit: "cups",
    number: 13,
    image: "/tarotdeck/queenofcups.jpeg",
    en: {
      description:
        "The Queen of Cups represents emotional depth, compassion, and intuitive understanding. She listens with her whole presence and offers care without needing to be asked.\n\nWhen this card appears, it invites you to lead with empathy. Trust your feelings, hold space for others, and remember that your softness is also a kind of wisdom.",
    },
  },
  {
    slug: "king-of-cups",
    nameEn: "King of Cups",
    arcana: "minor",
    suit: "cups",
    number: 14,
    image: "/tarotdeck/kingofcups.jpeg",
    en: {
      description:
        "The King of Cups represents emotional maturity, calm under pressure, and the steady wisdom of someone who knows themselves well. He balances heart and mind with quiet authority.\n\nThis card encourages you to respond rather than react, to offer guidance with patience, and to hold your inner waters still even when the world around you stirs.",
    },
  },
  {
    slug: "ace-of-pentacles",
    nameEn: "Ace of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 1,
    image: "/tarotdeck/aceofpentacles.jpeg",
    en: {
      description:
        "The Ace of Pentacles represents new opportunities in the material world, fresh foundations, and the seed of something stable and enduring. It speaks of beginnings rooted in the practical and tangible.\n\nWhen this card appears, it invites you to plant what you wish to grow. Whether starting a project, settling into a new space, or beginning a fresh routine, the soil is ready.",
    },
  },
  {
    slug: "two-of-pentacles",
    nameEn: "Two of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 2,
    image: "/tarotdeck/twoofpentacles.jpeg",
    en: {
      description:
        "The Two of Pentacles represents balance, adaptability, and the skill of managing many things at once. It speaks of juggling responsibilities while staying light on your feet.\n\nThis card reminds you that life moves in waves. Stay flexible, prioritise wisely, and remember that grace under pressure is its own quiet achievement.",
    },
  },
  {
    slug: "three-of-pentacles",
    nameEn: "Three of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 3,
    image: "/tarotdeck/threeofpentacles.jpeg",
    en: {
      description:
        "The Three of Pentacles represents collaboration, craftsmanship, and the satisfaction of building something well with others. It speaks of skill being recognised and effort being valued.\n\nWhen this card appears, it suggests that working together will bring better results than going it alone. Share your ideas, listen to others, and take pride in what you create as a team.",
    },
  },
  {
    slug: "four-of-pentacles",
    nameEn: "Four of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 4,
    image: "/tarotdeck/fourofpentacles.jpeg",
    en: {
      description:
        "The Four of Pentacles represents holding on, security, and the desire to protect what you have. It speaks of stability, but also of the risk of clinging too tightly.\n\nThis card asks you to consider what you are guarding and why. Some things deserve to be kept safe. Others grow only when given space. Find the balance between caution and openness.",
    },
  },
  {
    slug: "five-of-pentacles",
    nameEn: "Five of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 5,
    image: "/tarotdeck/fiveofpentacles.jpeg",
    en: {
      description:
        "The Five of Pentacles represents hardship, feeling left out, or going through a period of lack. It honours the loneliness that can come when times are difficult.\n\nThis card also reminds you that help is closer than it may seem. Look for the light. Reach out when you need to, and trust that this passage is temporary.",
    },
  },
  {
    slug: "six-of-pentacles",
    nameEn: "Six of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 6,
    image: "/tarotdeck/sixofpentacles.jpeg",
    en: {
      description:
        "The Six of Pentacles represents generosity, fairness, and the flow of giving and receiving. It speaks of sharing what you have and being open to support when it comes your way.\n\nWhen this card appears, it invites you to consider where balance is needed. Offer what you can. Accept help with grace. Abundance grows when it moves freely between people.",
    },
  },
  {
    slug: "seven-of-pentacles",
    nameEn: "Seven of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 7,
    image: "/tarotdeck/sevenofpentacles.jpeg",
    en: {
      description:
        "The Seven of Pentacles represents patience, assessment, and the long view that comes with steady effort. It speaks of pausing to evaluate progress and trusting that growth takes time.\n\nThis card invites you to step back and consider what you have planted. Some things are ready to harvest. Others need more time. Either way, your work is not wasted.",
    },
  },
  {
    slug: "eight-of-pentacles",
    nameEn: "Eight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 8,
    image: "/tarotdeck/eightofpentacles.jpeg",
    en: {
      description:
        "The Eight of Pentacles represents dedication, skill building, and the quiet pride of becoming good at something through practice. It speaks of focus, repetition, and care for the craft itself.\n\nWhen this card appears, it encourages you to keep going. Each small effort adds up. Mastery comes not from talent alone but from showing up day after day.",
    },
  },
  {
    slug: "nine-of-pentacles",
    nameEn: "Nine of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 9,
    image: "/tarotdeck/nineofpentacles.jpeg",
    en: {
      description:
        "The Nine of Pentacles represents independence, comfort, and the quiet enjoyment of the life you have built. It speaks of self sufficiency and the pleasure of moments truly your own.\n\nThis card invites you to appreciate your surroundings and recognise the freedom that comes from your own efforts. Take time to enjoy the fruits of what you have created.",
    },
  },
  {
    slug: "ten-of-pentacles",
    nameEn: "Ten of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 10,
    image: "/tarotdeck/tenofpentacles.jpeg",
    en: {
      description:
        "The Ten of Pentacles represents lasting stability, family, and the sense of being part of something that endures beyond the moment. It speaks of legacy, tradition, and the comfort of strong foundations.\n\nWhen this card appears, it honours what you and those before you have built. Take pride in the home, community, or shared history that supports you.",
    },
  },
  {
    slug: "page-of-pentacles",
    nameEn: "Page of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 11,
    image: "/tarotdeck/pageofpentacles.jpeg",
    en: {
      description:
        "The Page of Pentacles represents fresh study, new skills, and the eagerness to learn something practical. This figure approaches the world with curiosity and a willingness to start from the beginning.\n\nWhen this card appears, it invites you to take an interest in something new. Sign up for the class, begin the project, or read the book. Small starts lead to meaningful growth.",
    },
  },
  {
    slug: "knight-of-pentacles",
    nameEn: "Knight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 12,
    image: "/tarotdeck/knightofpentacles.jpeg",
    en: {
      description:
        "The Knight of Pentacles represents steady effort, reliability, and the slow but sure progress that comes from sticking with the plan. This figure values consistency over flash.\n\nThis card encourages you to be patient and methodical. Keep your commitments, follow through on the details, and trust that careful work builds lasting results.",
    },
  },
  {
    slug: "queen-of-pentacles",
    nameEn: "Queen of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 13,
    image: "/tarotdeck/queenofpentacles.jpeg",
    en: {
      description:
        "The Queen of Pentacles represents nurturing practicality, comfort, and the grounded warmth of someone who tends to home, family, and the everyday details with care.\n\nWhen this card appears, it invites you to look after the basics. Eat well, rest, tend to your space, and give thoughtful care to those around you. Quiet, consistent love is its own kind of magic.",
    },
  },
  {
    slug: "king-of-pentacles",
    nameEn: "King of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 14,
    image: "/tarotdeck/kingofpentacles.jpeg",
    en: {
      description:
        "The King of Pentacles represents established success, generosity, and the confidence of someone who has built something solid and enjoys sharing its rewards.\n\nThis card encourages you to lead with steadiness and to be generous with what you have. Stability is built over time, and you have the wisdom to manage what is in your care wisely.",
    },
  },
  {
    slug: "ace-of-swords",
    nameEn: "Ace of Swords",
    arcana: "minor",
    suit: "swords",
    number: 1,
    image: "/tarotdeck/aceofswords.jpeg",
    en: {
      description:
        "The Ace of Swords represents clarity, breakthrough, and a sudden flash of insight that cuts through confusion. It speaks of fresh perspective and the power of a clear thought.\n\nWhen this card appears, it invites you to speak plainly, see clearly, and act on what you now understand. Truth has its own momentum. Use it with care.",
    },
  },
  {
    slug: "two-of-swords",
    nameEn: "Two of Swords",
    arcana: "minor",
    suit: "swords",
    number: 2,
    image: "/tarotdeck/twoofswords.jpeg",
    en: {
      description:
        "The Two of Swords represents difficult choices, stalemate, and the moments when avoidance feels safer than deciding. It speaks of being caught between two options and choosing neither.\n\nThis card invites you to remove the blindfold. Look honestly at what is in front of you. Even an uncomfortable decision is better than staying frozen.",
    },
  },
  {
    slug: "three-of-swords",
    nameEn: "Three of Swords",
    arcana: "minor",
    suit: "swords",
    number: 3,
    image: "/tarotdeck/threeofswords.jpeg",
    en: {
      description:
        "The Three of Swords represents heartbreak, painful truths, and the sharp clarity that sometimes comes through sorrow. It honours the hurt that asks to be acknowledged.\n\nWhen this card appears, allow yourself to feel what is real. Pain does not last forever, and naming it is the first step toward letting it pass through you.",
    },
  },
  {
    slug: "four-of-swords",
    nameEn: "Four of Swords",
    arcana: "minor",
    suit: "swords",
    number: 4,
    image: "/tarotdeck/fourofswords.jpeg",
    en: {
      description:
        "The Four of Swords represents rest, recovery, and the wisdom of stepping back when you are tired. It speaks of stillness as a form of strength rather than retreat.\n\nThis card invites you to take a break. Quiet the mind, restore your body, and allow yourself the calm that comes before the next chapter begins.",
    },
  },
  {
    slug: "five-of-swords",
    nameEn: "Five of Swords",
    arcana: "minor",
    suit: "swords",
    number: 5,
    image: "/tarotdeck/fiveofswords.jpeg",
    en: {
      description:
        "The Five of Swords represents conflict, hollow victories, and the cost of winning at any price. It asks you to consider whether being right is worth what it takes from you.\n\nThis card invites reflection. Sometimes the wiser choice is to walk away. Choose your battles carefully, and remember that peace is often more valuable than triumph.",
    },
  },
  {
    slug: "six-of-swords",
    nameEn: "Six of Swords",
    arcana: "minor",
    suit: "swords",
    number: 6,
    image: "/tarotdeck/sixofswords.jpeg",
    en: {
      description:
        "The Six of Swords represents transition, moving on, and the quiet relief of leaving a difficult passage behind. It speaks of calmer waters ahead.\n\nWhen this card appears, it suggests that change is underway. The road may not be over, but the worst is passing. Carry only what you need and let the rest go.",
    },
  },
  {
    slug: "seven-of-swords",
    nameEn: "Seven of Swords",
    arcana: "minor",
    suit: "swords",
    number: 7,
    image: "/tarotdeck/sevenofswords.jpeg",
    en: {
      description:
        "The Seven of Swords represents cunning, strategy, and the temptation to take shortcuts. It can point to deception, either by others or by yourself.\n\nThis card asks you to be honest about your motives. Clever moves can backfire. Consider whether a more straightforward path might serve you better in the long run.",
    },
  },
  {
    slug: "eight-of-swords",
    nameEn: "Eight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 8,
    image: "/tarotdeck/eightofswords.jpeg",
    en: {
      description:
        "The Eight of Swords represents feeling trapped, restricted, or unable to see a way out. It speaks of the mental cages we sometimes build around ourselves.\n\nThis card reminds you that the bindings are looser than they appear. Look around. The path forward is there. Trust your ability to step out of the story that says you cannot move.",
    },
  },
  {
    slug: "nine-of-swords",
    nameEn: "Nine of Swords",
    arcana: "minor",
    suit: "swords",
    number: 9,
    image: "/tarotdeck/nineofswords.jpeg",
    en: {
      description:
        "The Nine of Swords represents worry, sleepless nights, and the way fear can grow larger in the quiet hours. It honours the weight of an anxious mind.\n\nThis card reminds you that not every thought is true. Bring your worries into the light of day. Speak them aloud, write them down, and notice how often the dread is heavier than the reality.",
    },
  },
  {
    slug: "ten-of-swords",
    nameEn: "Ten of Swords",
    arcana: "minor",
    suit: "swords",
    number: 10,
    image: "/tarotdeck/tenofswords.jpeg",
    en: {
      description:
        "The Ten of Swords represents endings, painful conclusions, and the rock bottom moment that finally clears the way for something new. It speaks of finality with the promise of fresh beginnings.\n\nWhen this card appears, know that the difficult part is ending. There is nowhere to fall from here but up. Allow yourself to grieve, then rise gently into what comes next.",
    },
  },
  {
    slug: "page-of-swords",
    nameEn: "Page of Swords",
    arcana: "minor",
    suit: "swords",
    number: 11,
    image: "/tarotdeck/pageofswords.jpeg",
    en: {
      description:
        "The Page of Swords represents curiosity, sharp thinking, and the eagerness to learn the truth of things. This figure asks questions and follows ideas wherever they lead.\n\nWhen this card appears, it invites you to stay curious, gather information, and speak up when you have something to say. Just be mindful of how your words land.",
    },
  },
  {
    slug: "knight-of-swords",
    nameEn: "Knight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 12,
    image: "/tarotdeck/knightofswords.jpeg",
    en: {
      description:
        "The Knight of Swords represents speed, conviction, and the drive to act on an idea without hesitation. This figure charges ahead, sometimes faster than wisdom suggests.\n\nThis card encourages bold action, but also caution. Move with purpose, but make sure you know where you are going. Quick decisions are powerful, but they leave little room for reflection.",
    },
  },
  {
    slug: "queen-of-swords",
    nameEn: "Queen of Swords",
    arcana: "minor",
    suit: "swords",
    number: 13,
    image: "/tarotdeck/queenofswords.jpeg",
    en: {
      description:
        "The Queen of Swords represents clear sight, honesty, and the kind of wisdom that comes from experience. She speaks plainly and sees through pretence.\n\nWhen this card appears, it invites you to lead with truth and to set clear boundaries. Compassion and clarity can live side by side. You do not have to soften the truth to be kind.",
    },
  },
  {
    slug: "king-of-swords",
    nameEn: "King of Swords",
    arcana: "minor",
    suit: "swords",
    number: 14,
    image: "/tarotdeck/kingofswords.jpeg",
    en: {
      description:
        "The King of Swords represents intellect, fairness, and the authority that comes from thinking clearly under pressure. He is a steady mind in difficult times.\n\nThis card encourages you to lead with reason, weigh the facts, and offer guidance that is both honest and considered. Wise judgement is your greatest asset right now.",
    },
  },
  {
    slug: "ace-of-wands",
    nameEn: "Ace of Wands",
    arcana: "minor",
    suit: "wands",
    number: 1,
    image: "/tarotdeck/aceofwands.jpeg",
    en: {
      description:
        "The Ace of Wands represents inspiration, new energy, and the spark that ignites a fresh creative path. It speaks of passion, possibility, and the urge to begin.\n\nWhen this card appears, it invites you to follow the spark. Whatever has been stirring in you is ready to take form. Trust the impulse and act on it.",
    },
  },
  {
    slug: "two-of-wands",
    nameEn: "Two of Wands",
    arcana: "minor",
    suit: "wands",
    number: 2,
    image: "/tarotdeck/twoofwands.jpeg",
    en: {
      description:
        "The Two of Wands represents planning, vision, and the moment of standing at the edge of what could be. It speaks of looking outward and considering your next move.\n\nThis card invites you to dream broadly and choose your direction with care. The world is wider than it seems. Where you go next is yours to decide.",
    },
  },
  {
    slug: "three-of-wands",
    nameEn: "Three of Wands",
    arcana: "minor",
    suit: "wands",
    number: 3,
    image: "/tarotdeck/threeofwands.jpeg",
    en: {
      description:
        "The Three of Wands represents expansion, foresight, and the satisfaction of watching plans begin to unfold. It speaks of progress and the horizon coming into view.\n\nWhen this card appears, it suggests that your efforts are bearing fruit. Stay patient as things develop and remain open to opportunities that arrive from unexpected places.",
    },
  },
  {
    slug: "four-of-wands",
    nameEn: "Four of Wands",
    arcana: "minor",
    suit: "wands",
    number: 4,
    image: "/tarotdeck/fourofwands.jpeg",
    en: {
      description:
        "The Four of Wands represents celebration, home, and the joy of arriving at a milestone worth marking. It speaks of harmony, belonging, and shared accomplishment.\n\nThis card invites you to pause and appreciate what you have built. Gather with those who matter to you. Joy shared is joy multiplied.",
    },
  },
  {
    slug: "five-of-wands",
    nameEn: "Five of Wands",
    arcana: "minor",
    suit: "wands",
    number: 5,
    image: "/tarotdeck/fiveofwands.jpeg",
    en: {
      description:
        "The Five of Wands represents friction, competition, and the energy of differing opinions colliding. It speaks of disagreements that can either fragment or sharpen, depending on how they are handled.\n\nThis card invites you to listen as much as you speak. Conflict can be productive when met with patience. Look for common ground beneath the noise.",
    },
  },
  {
    slug: "six-of-wands",
    nameEn: "Six of Wands",
    arcana: "minor",
    suit: "wands",
    number: 6,
    image: "/tarotdeck/sixofwands.jpeg",
    en: {
      description:
        "The Six of Wands represents victory, recognition, and the pride of having your efforts acknowledged. It speaks of public success and the rewards of perseverance.\n\nWhen this card appears, it honours your hard work. Accept the praise with grace, share credit where it is due, and let this moment encourage you to keep going.",
    },
  },
  {
    slug: "seven-of-wands",
    nameEn: "Seven of Wands",
    arcana: "minor",
    suit: "wands",
    number: 7,
    image: "/tarotdeck/sevenofwands.jpeg",
    en: {
      description:
        "The Seven of Wands represents standing your ground, defending what you have built, and holding firm in the face of challenge. It speaks of conviction tested.\n\nThis card encourages you to stay strong. You have the high ground. Trust what you know, hold your position, and remember that boundaries are sometimes worth defending.",
    },
  },
  {
    slug: "eight-of-wands",
    nameEn: "Eight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 8,
    image: "/tarotdeck/eightofwands.jpeg",
    en: {
      description:
        "The Eight of Wands represents swift movement, momentum, and the rapid unfolding of events. It speaks of messages arriving quickly and progress picking up speed.\n\nWhen this card appears, expect things to move. Stay agile, respond promptly, and ride the wave of energy that is now in motion.",
    },
  },
  {
    slug: "nine-of-wands",
    nameEn: "Nine of Wands",
    arcana: "minor",
    suit: "wands",
    number: 9,
    image: "/tarotdeck/nineofwands.jpeg",
    en: {
      description:
        "The Nine of Wands represents resilience, the last stretch, and the quiet strength of someone who has come a long way and is determined to see things through.\n\nThis card reminds you that you are stronger than you feel. Rest if you need to, but do not give up. You are closer to the finish than you think.",
    },
  },
  {
    slug: "ten-of-wands",
    nameEn: "Ten of Wands",
    arcana: "minor",
    suit: "wands",
    number: 10,
    image: "/tarotdeck/tenofwands.jpeg",
    en: {
      description:
        "The Ten of Wands represents burden, responsibility, and the weight of carrying too much for too long. It speaks of the cost of doing it all alone.\n\nThis card invites you to set some of it down. You do not have to carry every load yourself. Ask for help, simplify where you can, and remember that rest is part of the work.",
    },
  },
  {
    slug: "page-of-wands",
    nameEn: "Page of Wands",
    arcana: "minor",
    suit: "wands",
    number: 11,
    image: "/tarotdeck/pageofwands.jpeg",
    en: {
      description:
        "The Page of Wands represents enthusiasm, fresh ideas, and the spark of an adventure waiting to begin. This figure is bold, curious, and ready to explore.\n\nWhen this card appears, it invites you to follow your excitement. New interests, travel, or creative urges may be calling. Say yes and see where they lead.",
    },
  },
  {
    slug: "knight-of-wands",
    nameEn: "Knight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 12,
    image: "/tarotdeck/knightofwands.jpeg",
    en: {
      description:
        "The Knight of Wands represents passion, action, and the drive to chase what excites you. This figure moves quickly, fueled by inspiration and confidence.\n\nThis card encourages you to act on your ideas, but also to think before you leap. Channel your energy with purpose so that your enthusiasm carries you somewhere worth going.",
    },
  },
  {
    slug: "queen-of-wands",
    nameEn: "Queen of Wands",
    arcana: "minor",
    suit: "wands",
    number: 13,
    image: "/tarotdeck/queenofwands.jpeg",
    en: {
      description:
        "The Queen of Wands represents warmth, confidence, and the magnetic presence of someone fully at home in themselves. She inspires others simply by being who she is.\n\nWhen this card appears, it invites you to step into your own light. Trust your charisma, lead with heart, and let your authenticity draw the right people and opportunities toward you.",
    },
  },
  {
    slug: "king-of-wands",
    nameEn: "King of Wands",
    arcana: "minor",
    suit: "wands",
    number: 14,
    image: "/tarotdeck/kingofwands.jpeg",
    en: {
      description:
        "The King of Wands represents vision, leadership, and the confident drive of someone who turns ideas into movements. He leads with passion balanced by experience.\n\nThis card encourages you to think big, take charge of your direction, and inspire those around you. Bold action grounded in wisdom can take you far.",
    },
  },
];

export const cardBySlug = new Map(cards.map((card) => [card.slug, card]));

const ROMAN = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI",
  "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
];

export function romanNumeral(n: number): string {
  return ROMAN[n] ?? String(n);
}
