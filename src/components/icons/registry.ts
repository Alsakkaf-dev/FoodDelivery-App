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
