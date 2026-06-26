import { createElement, type ComponentType } from 'react';
import type { IconProps } from './icon-base';
import {
  HomeIcon, SearchIcon, MenuIcon, BagIcon, CartIcon, UserIcon, ClipboardIcon,
  SettingsIcon, UtensilsIcon, MoonIcon, ScooterIcon, BikeIcon, StoreIcon,
} from './nav';
import {
  PlusIcon, MinusIcon, CheckIcon, CloseIcon, TrashIcon, EditIcon, ShareIcon,
  FilterIcon, SlidersIcon, CameraIcon, UploadIcon, CloudUploadIcon, EyeIcon,
  EyeOffIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon,
  ChevronStartIcon, ArrowLeftIcon, SendIcon, HeartIcon, HeartFilledIcon,
  RefreshIcon, ResetIcon,
} from './actions';
import {
  StarIcon, StarFilledIcon, TruckIcon, ClockIcon, MapPinIcon, NavigationIcon,
  WalletIcon, CreditCardIcon, BellIcon, MailIcon, PhoneIcon, MessageIcon,
  InfoIcon, AlertIcon, CheckCircleIcon, HomeAddressIcon, BriefcaseIcon, MicIcon,
  MicOffIcon, SpeakerIcon, VolumeIcon, PhoneOffIcon, FlameIcon,
} from './meta';
import { FacebookIcon, TwitterIcon, AppleIcon, GoogleIcon } from './social';
import {
  BurgerIcon, FriesIcon, DrumstickIcon, WrapIcon, PizzaIcon, DrinkIcon,
  BowlIcon, CoffeeIcon,
} from './food';

export type IconComponent = ComponentType<IconProps>;

// Canonical name list. `IconName` is derived from it, and ICON_REGISTRY is typed
// `Record<IconName, …>` — so a name added here without a matching component (or
// vice-versa) is a COMPILE error. This is the SUPERSET of FOUNDATION_CONTRACTS.md
// §3 (a missing contracted name = TS error in a consumer), plus `cart` (#04
// CartBadge) and `flame` (#07 active-category accent).
export const ICON_NAMES = [
  // nav / chrome
  'home', 'search', 'menu', 'bag', 'cart', 'user', 'clipboard', 'settings',
  'utensils', 'moon', 'scooter', 'bike', 'store',
  // actions / controls (directional ones auto-mirror under RTL)
  'plus', 'minus', 'check', 'close', 'trash', 'edit', 'share', 'filter',
  'sliders', 'camera', 'upload', 'cloud-upload', 'eye', 'eye-off',
  'chevron-left', 'chevron-right', 'chevron-down', 'chevron-start', 'arrow-left',
  'send', 'heart', 'heart-filled', 'refresh', 'reset',
  // meta / status / contact
  'star', 'star-filled', 'truck', 'clock', 'map-pin', 'navigation', 'wallet',
  'credit-card', 'bell', 'mail', 'phone', 'message', 'info', 'alert',
  'check-circle', 'home-address', 'briefcase', 'mic', 'mic-off', 'speaker',
  'volume', 'phone-off', 'flame',
  // social auth
  'facebook', 'twitter', 'apple', 'google',
  // food / ingredient
  'burger', 'fries', 'drumstick', 'wrap', 'pizza', 'drink', 'bowl', 'coffee',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * name → component map. Used by `<Icon name="…"/>` and by Plan 04's nav, which
 * keeps `NavItem.icon` a plain `IconName` STRING (src/lib/nav/items.ts stays
 * React-free for the server/unit tests) and resolves it here.
 */
export const ICON_REGISTRY: Record<IconName, IconComponent> = {
  home: HomeIcon, search: SearchIcon, menu: MenuIcon, bag: BagIcon,
  cart: CartIcon, user: UserIcon, clipboard: ClipboardIcon,
  settings: SettingsIcon, utensils: UtensilsIcon, moon: MoonIcon,
  scooter: ScooterIcon, bike: BikeIcon, store: StoreIcon,
  plus: PlusIcon, minus: MinusIcon, check: CheckIcon, close: CloseIcon,
  trash: TrashIcon, edit: EditIcon, share: ShareIcon, filter: FilterIcon,
  sliders: SlidersIcon, camera: CameraIcon, upload: UploadIcon,
  'cloud-upload': CloudUploadIcon, eye: EyeIcon, 'eye-off': EyeOffIcon,
  'chevron-left': ChevronLeftIcon, 'chevron-right': ChevronRightIcon,
  'chevron-down': ChevronDownIcon, 'chevron-start': ChevronStartIcon,
  'arrow-left': ArrowLeftIcon, send: SendIcon, heart: HeartIcon,
  'heart-filled': HeartFilledIcon, refresh: RefreshIcon, reset: ResetIcon,
  star: StarIcon, 'star-filled': StarFilledIcon, truck: TruckIcon,
  clock: ClockIcon, 'map-pin': MapPinIcon, navigation: NavigationIcon,
  wallet: WalletIcon, 'credit-card': CreditCardIcon, bell: BellIcon,
  mail: MailIcon, phone: PhoneIcon, message: MessageIcon, info: InfoIcon,
  alert: AlertIcon, 'check-circle': CheckCircleIcon,
  'home-address': HomeAddressIcon, briefcase: BriefcaseIcon, mic: MicIcon,
  'mic-off': MicOffIcon, speaker: SpeakerIcon, volume: VolumeIcon,
  'phone-off': PhoneOffIcon, flame: FlameIcon,
  facebook: FacebookIcon, twitter: TwitterIcon, apple: AppleIcon,
  google: GoogleIcon,
  burger: BurgerIcon, fries: FriesIcon, drumstick: DrumstickIcon,
  wrap: WrapIcon, pizza: PizzaIcon, drink: DrinkIcon, bowl: BowlIcon,
  coffee: CoffeeIcon,
};

export type IconRenderProps = IconProps & { name: IconName };

/**
 * Resolve a glyph by name. The ergonomic entry point for consumers that hold a
 * name string (nav items, EmptyState `illustration`, list-row leading icons):
 *   <Icon name="home" className="text-brand" />
 * For static call-sites prefer the tree-shakeable named export (`<HomeIcon/>`).
 */
export function Icon({ name, ...props }: IconRenderProps) {
  // createElement (not JSX) keeps this a valid `.ts` file per FOUNDATION_CONTRACTS §3.
  return createElement(ICON_REGISTRY[name], props);
}
