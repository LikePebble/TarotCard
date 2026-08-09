import type { CardLore } from "./types";

/** Card-specific English lore, freshly written from the RWS symbolic tradition. */
export const loreMajorEn: Record<string, CardLore> = {
  "the-fool": {
    symbols: [
      { name: "Step at the edge", meaning: "A willing step into experience before every consequence can be known." },
      { name: "White rose", meaning: "An uncluttered intention that has not yet been shaped by calculation." },
      { name: "Light bundle", meaning: "Only the most useful lessons of the past are carried into the new road." },
    ],
    story: "The Fool is numbered zero, a place that can stand before the sequence or travel through all of it. That ambiguity made the card a natural traveler in the modern story often called the Fool's Journey.\n\nA popular tradition links the Fool with the later playing-card Joker, though the historical line is debated. What the two clearly share is freedom from a fixed rank and the power to enter almost any situation.",
    astrology: "Uranus · Air",
  },
  "the-magician": {
    symbols: [
      { name: "Infinity above the head", meaning: "Potential remains available when attention and skill are kept in motion." },
      { name: "One hand above, one below", meaning: "An idea is received, directed, and made tangible through deliberate action." },
      { name: "Four tools on the table", meaning: "Wand, cup, sword, and pentacle place every elemental resource within reach." },
    ],
    story: "Early Italian cards portrayed a street performer or juggler, a figure known for dexterity and persuasive display. The French Bateleur retained something of that quick-handed, itinerant character.\n\nNineteenth-century occult traditions recast the performer as a channel between intention and matter. In the RWS image, practiced hands do more than entertain: they arrange available tools so possibility can become work in the world.",
    astrology: "Mercury",
  },
  "the-high-priestess": {
    symbols: [
      { name: "Veil between pillars", meaning: "A threshold separates what is openly known from what must be approached inwardly." },
      { name: "Partly hidden scroll", meaning: "Knowledge is present, but not every part of it is disclosed at once." },
      { name: "Lunar crown", meaning: "Changing phases give intuitive awareness an authority different from fixed certainty." },
    ],
    story: "In early Italian tarot this figure was the Popess. A later legend associated her with Pope Joan, although the history behind that story is uncertain.\n\nWaite rejected a simple historical identification and made her the guardian of an inner sanctuary. The RWS High Priestess therefore holds a pause in the sequence: not a refusal to answer, but an invitation to listen before naming what is sensed.",
    astrology: "Moon",
  },
  "the-empress": {
    symbols: [
      { name: "Ripening grain", meaning: "Care becomes visible as nourishment, growth, and an environment in which life can continue." },
      { name: "Crown of twelve stars", meaning: "Her authority follows the larger cycles of nature rather than force alone." },
      { name: "Shield of Venus", meaning: "Protection is marked by relationship, beauty, and the power to attract rather than attack." },
    ],
    story: "The Empress in early courtly decks carried imperial emblems and may have echoed the dignity of a particular noblewoman. Her first character was political and dynastic as much as natural.\n\nIn the RWS tradition, imperial heraldry gives way to Venus, grain, flowing water, and seed-rich pomegranates. The ruler of one household becomes a wider image of creative abundance and the conditions that let something flourish.",
    astrology: "Venus",
  },
  "the-emperor": {
    symbols: [
      { name: "Ram-headed throne", meaning: "Aries lends the seat initiative, directness, and the readiness to establish order." },
      { name: "Orb and ankh-like scepter", meaning: "Authority joins practical rule with a responsibility larger than personal preference." },
      { name: "Armor beneath the robe", meaning: "Visible composure rests on preparedness to defend the structure being maintained." },
    ],
    story: "Marseille Emperors were commonly shown in profile with crossed legs, a posture readers connected with the stable number four and, in some traditions, an alchemical sign. The body itself became an emblem of material order.\n\nThe RWS Emperor turns to face the viewer from a stone throne. His severe landscape does not promise comfort; it emphasizes the boundaries, decisions, and durable framework through which protection can operate.",
    astrology: "Aries",
  },
  "the-hierophant": {
    symbols: [
      { name: "Triple crown", meaning: "Teaching claims responsibility across bodily, intellectual, and spiritual levels." },
      { name: "Crossed keys", meaning: "Public instruction and guarded knowledge are held together at the same threshold." },
      { name: "Two students", meaning: "A tradition survives through relationship between what has been learned and who receives it next." },
    ],
    story: "Known as the Pope in early European decks, this card carried recognizable signs of ecclesiastical authority. Its old image was tied to an institution and its power to preserve doctrine.\n\nWaite renamed the figure the Hierophant, using the Greek title for one who reveals sacred things. The change widens the card from one office to the broader act of transmitting a tested body of knowledge within a community.",
    astrology: "Taurus",
  },
  "the-lovers": {
    symbols: [
      { name: "Angel above the pair", meaning: "Relationship is placed beneath a perspective larger than immediate desire." },
      { name: "Tree of flame and tree of fruit", meaning: "Passion and knowledge grow differently, and each carries its own consequence." },
      { name: "Mountain between them", meaning: "Union does not erase distance; honest connection includes what must still be crossed." },
    ],
    story: "The Marseille card showed a young person between two possible partners while Cupid aimed from above. Its central drama was choice, including the social and moral consequences of commitment.\n\nThe RWS design replaced that triangle with an Edenic pair under the angel Raphael. Choice remains, but it is now expressed through the vulnerability of meeting another person without disguise and deciding what kind of bond to make.",
    astrology: "Gemini",
  },
  "the-chariot": {
    symbols: [
      { name: "Black and white sphinxes", meaning: "Contrary drives must move together if determination is to become direction." },
      { name: "Absent reins", meaning: "The vehicle is guided through disciplined intention rather than brute control." },
      { name: "Starred canopy", meaning: "A public advance remains connected to a larger pattern above personal triumph." },
    ],
    story: "Early Chariots drew on the imagery of Roman triumph, often with horses carrying a celebrated figure in procession. Victory was a visible arrival acknowledged by the surrounding world.\n\nNineteenth-century occult designs replaced the horses with sphinxes, reflecting an Egypt-centered theory of tarot now considered historically unsupported. The image endured because it gave the card a precise tension: progress depends on reconciling forces that would otherwise diverge.",
    astrology: "Cancer",
  },
  strength: {
    symbols: [
      { name: "Hands at the lion's jaws", meaning: "Instinct is met with calm contact instead of being crushed or denied." },
      { name: "Infinity sign", meaning: "Gentle steadiness can draw on a source of power as enduring as the Magician's will." },
      { name: "Garland and white clothing", meaning: "Openness and composure stand before raw force without needing armor." },
    ],
    story: "In the Marseille order, Strength occupied position eleven while Justice held position eight. The Golden Dawn exchanged them to align the cards with its astrological sequence, placing lion-hearted Strength with Leo.\n\nThe RWS image makes the card's argument quietly. The lion is neither slain nor chained; courage appears as the capacity to stay present with intense appetite, anger, or fear until it can be guided.",
    astrology: "Leo",
  },
  "the-hermit": {
    symbols: [
      { name: "Lantern with six-pointed star", meaning: "Wisdom illuminates the next portion of the path, not every mile at once." },
      { name: "Staff", meaning: "A simple, tested support makes solitary movement possible without pretending to need nothing." },
      { name: "Snowy height", meaning: "Distance from ordinary noise creates perspective rather than superiority." },
    ],
    story: "The old figure behind the Hermit was Father Time, carrying an hourglass as a sign of age and mortality. The lantern entered later and gradually changed the card from elapsed time to searching consciousness.\n\nThe lantern also recalls stories of Diogenes walking with a lamp in search of an honest person. In the RWS sequence, the Hermit withdraws not to disappear but to find a light reliable enough to carry back.",
    astrology: "Virgo",
  },
  "wheel-of-fortune": {
    symbols: [
      { name: "Sphinx on the rim", meaning: "A centered awareness can remain poised even while circumstances turn beneath it." },
      { name: "Rising and descending figures", meaning: "Gain and loss belong to the same cycle rather than to separate worlds." },
      { name: "Letters around the wheel", meaning: "TARO and ROTA invite several readings, showing how meaning changes with position." },
    ],
    story: "The medieval Wheel of Fortune gave visual form to an old lesson: no worldly position remains fixed. Boethius's account of Fortune's turning wheel helped make the image familiar across Europe.\n\nThe RWS card layers that inheritance with Hebrew letters, alchemical signs, and Egyptianizing figures. Its dense rim suggests that change can be read through many systems, but none can stop the wheel from moving.",
    astrology: "Jupiter",
  },
  justice: {
    symbols: [
      { name: "Level scales", meaning: "Evidence and consequence are weighed against one another before judgment is made." },
      { name: "Upright sword", meaning: "A decision must be clear enough to cut through preference and apply both ways." },
      { name: "Purple veil", meaning: "Even a principled ruling stands before circumstances that may not be fully visible." },
    ],
    story: "Justice retained its scales and sword through centuries of tarot design. What changed most dramatically was its place in the sequence: Marseille decks numbered it eight, while the Golden Dawn moved it to eleven to correspond with Libra.\n\nThe RWS figure faces forward, emphasizing accountability rather than punishment alone. The card asks how a choice was made, what follows from it, and whether the same standard could fairly be offered to everyone involved.",
    astrology: "Libra",
  },
  "the-hanged-man": {
    symbols: [
      { name: "Suspension by one ankle", meaning: "An ordinary viewpoint is interrupted so another orientation can become possible." },
      { name: "Halo", meaning: "Stillness brings insight; the posture is not shown as humiliation or defeat." },
      { name: "Living wooden frame", meaning: "The pause is held by something that can grow, rather than by a dead instrument of punishment." },
    ],
    story: "Older Italian images resembled the pittura infamante, public paintings that shamed traitors by depicting them upside down. That historical echo gave the card an association with reversal and social disgrace.\n\nWaite transformed the suspended figure into a willing contemplative whose face is serene and illuminated. The RWS card turns enforced inversion into a chosen surrender of familiar assumptions so that value can be seen differently.",
    astrology: "Neptune · Water",
  },
  death: {
    symbols: [
      { name: "White rose banner", meaning: "A simple living pattern continues through the ending of a former shape." },
      { name: "Fallen crown", meaning: "No rank or identity can exempt itself from change." },
      { name: "Sun between towers", meaning: "Beyond the visible ending, another horizon remains available." },
    ],
    story: "The skeletal reaper is one of tarot's oldest durable images, related to medieval dances of death in which every social rank met the same end. Early cards emphasized the leveling force of mortality.\n\nThe RWS scene retains that seriousness but adds a rising sun and a white banner. The card is not a prediction of literal death; within the sequence it describes the irreversible ending that clears space for a form of life no longer organized by what came before.",
    astrology: "Scorpio",
  },
  temperance: {
    symbols: [
      { name: "Water between two cups", meaning: "Separate contents are blended through patient adjustment rather than forced sameness." },
      { name: "One foot on land, one in water", meaning: "Practical reality and inner feeling are held in contact at the same time." },
      { name: "Path toward a radiant crown", meaning: "Repeated small acts of balance open a longer route toward integration." },
    ],
    story: "The act of pouring between vessels comes from the classical virtue of temperance: proportion, restraint, and the mixing of wine and water. It was never simply a command to avoid pleasure, but to find a sustainable measure.\n\nIn the RWS card, the liquid seems to travel at an uncanny angle between the cups. The image suggests an art of combining what appears incompatible until a third, more workable condition emerges.",
    astrology: "Sagittarius",
  },
  "the-devil": {
    symbols: [
      { name: "Loose chains", meaning: "The bond is real, yet its looseness suggests that participation and awareness still matter." },
      { name: "Inverted torch", meaning: "Creative fire is directed downward into compulsion, appetite, and narrowed attention." },
      { name: "Half-human figures", meaning: "What is repeatedly obeyed begins to shape how people understand themselves." },
    ],
    story: "The horned figure draws on Christian images of the adversary and on later occult fascination with the goat-shaped Baphomet. These sources were combined into a theatrical emblem of bondage.\n\nThe RWS pair echo the Lovers, but stand chained beneath a darker authority. Their chains are not tight around the neck, a detail that shifts the reading from absolute imprisonment toward the difficult recognition of habits, bargains, and fears that can be named.",
    astrology: "Capricorn",
  },
  "the-tower": {
    symbols: [
      { name: "Lightning strike", meaning: "A truth or event arrives too directly for the old structure to absorb it unchanged." },
      { name: "Falling crown", meaning: "An assumption of control is displaced from the top of the structure it ruled." },
      { name: "Figures in open air", meaning: "When containment fails, vulnerability and release can appear together." },
    ],
    story: "Earlier tarot called this image the House of God or showed a structure struck from above. Readers have connected it with the Tower of Babel and with the general medieval motif of pride brought down, though no single origin fully explains it.\n\nThe RWS card freezes the instant a sealed construction can no longer contain reality. Its violence is not presented as desirable, but the opened crown makes one thing plain: whatever was built on denial cannot be restored merely by pretending the strike did not occur.",
    astrology: "Mars",
  },
  "the-star": {
    symbols: [
      { name: "One large and seven small stars", meaning: "A guiding center is surrounded by a wider field of quiet orientation." },
      { name: "Water poured on land and pool", meaning: "Inner replenishment and practical renewal are tended together." },
      { name: "Uncovered figure", meaning: "After the Tower's rupture, openness replaces the need to defend an image." },
    ],
    story: "A star-bearing woman appears in early tarot as a sign of hope and celestial influence. The RWS composition also resembles the ancient motif of a life-giving water bearer, with one stream returning to the pool and another entering the earth.\n\nPlaced after the Tower, the card's gentleness matters. Hope here is not loud certainty that nothing difficult will happen; it is the capacity to begin restoring trust with repeated, unguarded acts of care.",
    astrology: "Aquarius",
  },
  "the-moon": {
    symbols: [
      { name: "Dog and wolf", meaning: "The familiar and the untamed respond differently to the same uncertain light." },
      { name: "Crayfish leaving the water", meaning: "A primitive feeling rises from depths that language has not yet organized." },
      { name: "Road between towers", meaning: "A passage continues beyond the visible threshold even when its destination is unclear." },
    ],
    story: "Moon cards long carried a night landscape with animals looking upward. In the RWS version, the dog, wolf, and emerging crayfish map layers of instinct from domesticated response to the oldest movements of the psyche.\n\nMoonlight reveals shape without full color or certainty. The card therefore does not declare that every fear is true or false; it asks for slower navigation while perception is active but incomplete.",
    astrology: "Pisces",
  },
  "the-sun": {
    symbols: [
      { name: "Radiant sun", meaning: "What was difficult to distinguish under moonlight becomes available to direct awareness." },
      { name: "Child on a white horse", meaning: "Vitality moves openly, without the armor or status of a conquering rider." },
      { name: "Sunflowers beyond the wall", meaning: "Growth turns toward light while a former boundary remains behind." },
    ],
    story: "Earlier Sun cards often showed two children or young figures beneath the solar disk. The RWS design concentrates that companionship into one child riding freely under a broad red banner.\n\nThe wall is low, the face is uncovered, and the horse moves without visible reins. After the Moon's ambiguity, the card presents clarity as a lived warmth: enough safety to be seen, to take joy seriously, and to let energy circulate again.",
    astrology: "Sun",
  },
  judgement: {
    symbols: [
      { name: "Trumpet and banner", meaning: "A call arrives that asks for response, not passive admiration." },
      { name: "Figures rising from coffins", meaning: "A former condition opens and those within it stand into a changed life." },
      { name: "Distant mountains", meaning: "The awakening is collective, extending beyond one private decision." },
    ],
    story: "The card's older title was the Last Judgment, and its composition follows Christian resurrection imagery: an angel sounds a trumpet while the dead rise. That history gives it the scale of a final reckoning.\n\nModern reading often emphasizes the moment of answering an inner summons. The RWS figures rise without possessions or disguises, suggesting an honest review in which what has been learned can become a new basis for action.",
    astrology: "Pluto · Fire",
  },
  "the-world": {
    symbols: [
      { name: "Wreath", meaning: "A living boundary holds completion without making it rigid or sealed forever." },
      { name: "Two wands", meaning: "Creative power is balanced in both hands after traveling through the full sequence." },
      { name: "Four corner figures", meaning: "The fixed signs and fourfold world witness a center that can include difference." },
    ],
    story: "The four beings in the corners descend from the vision of Ezekiel and later became symbols of the four evangelists, elements, and fixed zodiac signs. They frame a long tradition of representing a complete, ordered cosmos.\n\nAt the center, the dancing figure is enclosed but not trapped by the wreath. The final card closes the sequence while leaving movement intact: completion means that the parts can belong together, not that growth has ended.",
    astrology: "Saturn · Earth",
  },
};
