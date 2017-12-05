import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as mocha from 'mocha';
import * as rpErrors from 'request-promise-native/errors';
import {
    BungieMembershipType,
    ComponentType,
    DestinyActivityModeType,
    DestinyStatsGroupType,
    PlatformErrorCodes,
    TypeDefinition,
} from '../src/enums';
import { IAPIResponse } from '../src/interfaces';
import Manifest from '../src/Manifest';
import OauthError from '../src/OAuthError';
import Traveler from '../src/Traveler';

chai.use(chaiAsPromised);

const traveler = new Traveler({
    apikey: process.env.API_KEY as string,
    debug: true,
    oauthClientId: process.env.OAUTH_ID,
    oauthClientSecret: process.env.OAUTH_SECRET,
    userAgent: '',
});

describe('traveler#getManifest', () => {
    it('respond with current manifest formatted in JSON', async () => {
        const result = await traveler.getDestinyManifest();
        return expect(result.Response).to.be.an('object').that.has.all.keys(
            'mobileAssetContentPath',
            'mobileClanBannerDatabasePath',
            'mobileGearAssetDataBases',
            'mobileGearCDN',
            'mobileWorldContentPaths',
            'version');
    });
});

describe('traveler#getDestinyEntityDefinition', () => {
    it('respond with JSON data about the weapon called Blue Shift', async () => {
        const result = await traveler.getDestinyEntityDefinition(TypeDefinition.DestinyInventoryItemDefinition, '417474226');
        return expect(result.Response.hash).to.be.an('number').and.equals(417474226);
    });

    it('gets rejected due to wrong parameters', async () => {
        return expect(traveler.getDestinyEntityDefinition(TypeDefinition.DestinyInventoryItemDefinition, '')).to.be.rejectedWith(Error);
    });
});

describe('traveler#searchDestinyPlayer', () => {
    it('respond with matching player', async () => {
        const result = await traveler.searchDestinyPlayer(BungieMembershipType.All, 'playername');
        expect(result.Response[0].displayName.toLowerCase()).equals('playername');
    });
    it('gets rejected due to wrong parameters', async () => {
        expect(traveler.searchDestinyPlayer(BungieMembershipType.All, '')).to.be.rejectedWith(Error);
    });
});

describe('traveler#getProfile', () => {
    it('respond with the matching profile', async () => {
        const result = await traveler.getProfile(BungieMembershipType.PSN, '4611686018452033461', { components: [ComponentType.Profiles] });
        return expect(result.Response).to.be.an('object').and.to.include.keys('profile');
    });
    it('gets rejected due to requesting PSN profile data but providing XBOX member type and wrong id', async () => {
        expect(traveler.getProfile(BungieMembershipType.Xbox, '', { components: [ComponentType.Profiles] })).to.be.rejectedWith(Error);
    });
});

describe('traveler#getCharacter', () => {
    it('respond with matching character and only character components', async () => {
        const result = await traveler.getCharacter(BungieMembershipType.PSN, '4611686018452033461', '2305843009265042115', {
            components:
                [
                    ComponentType.Characters,
                    ComponentType.CharacterInventories,
                    ComponentType.CharacterProgressions,
                    ComponentType.CharacterRenderData,
                    ComponentType.CharacterActivities,
                    ComponentType.CharacterEquipment,
                ],
        });
        return expect(result.Response).to.be.an('object').and.to.include.keys('activities', 'character', 'equipment', 'inventory', 'renderData', 'itemComponents', 'progressions');
    });
    // TODO: make rejected test
});

// TODO: getClanWeeklyRewardState
describe('traveler#getClanWeeklyRewardState', () => {
    it('respond with information on the weekly clan reward', async () => {
        const result = await traveler.getClanWeeklyRewardState('1812014');
        return expect(result.ErrorCode).to.be.equal(PlatformErrorCodes.Success);
    });

    it('fails with with information on the weekly clan reward', async () => {
        return expect(traveler.getClanWeeklyRewardState('-1')).to.be.rejected;
    });

});

/*
describe('traveler#getItem', () => {
    it('respond with matching item', async () => {
        const result = await traveler.getItem(BungieMembershipType.PSN, '4611686018452033461', '6917529033189743362', { components: [ComponentType.ItemCommonData] });
        return expect(result.Response.item.data).to.be.an('object').and.have.all.keys(
            'itemHash',
            'itemInstanceId',
            'quantity',
            'bindStatus',
            'location',
            'bucketHash',
            'transferStatus',
            'lockable',
            'state',
        );
    });
});*/

// TODO: getVendors (not yet final)

// TODO: getVendor (not yet final)

// TODO: getPostGameCarnageReport

describe('traveler#getHistoricalStatsDefinition', () => {
    it('respond with matching historical stat definitions', async () => {
        const result = await traveler.getHistoricalStatsDefinition();
        return assert.equal(result.ErrorCode, PlatformErrorCodes.Success, 'Response was not successful');

    });
});

// TODO: getCLanLeaderboards (not yet final)

// TODO: getClanAggregratedStats (not yet final)

// TODO: getLeaderboards (not yet final)

// TODO: getLeaderboardsForCharacter (not yet final)

describe('traveler#searchDestinyEntities', () => {
    it('respond with matching search results for sunshot', async () => {
        const result = await traveler.searchDestinyEntities('sunshot', TypeDefinition.DestinyInventoryItemDefinition, { page: 0 });
        return expect(result.Response.suggestedWords).to.be.a('array').and.includes('sunshot');
    });
});

describe('traveler#getHistoricalStats', () => {
    it('respond with historical stats', async () => {
        const result = await traveler.getHistoricalStats(BungieMembershipType.PSN, '4611686018452033461', '2305843009265042115', { dayend: '2017-09-30', daystart: '2017-09-20', groups: [DestinyStatsGroupType.Activity] });
        return expect(result.ErrorCode).to.be.equal(PlatformErrorCodes.Success);
    });

    it('fails to response with historical stats due to invalid date parameter', async () => {
        return expect(traveler.getHistoricalStats(BungieMembershipType.PSN, '4611686018452033461', '2305843009265042115', { dayend: '2017-09-40', daystart: '2017-09-20', groups: [DestinyStatsGroupType.Activity] })).to.be.rejected;
    });
});

// TODO: getHistoricalStatsForAccount (not yet final)

// TODO: getActivityHistory (not yet final)

// TODO: getUniqueWeaponHistory (not yet final)

// TODO: getAggregateActivityStats (not yet final)

describe('traveler#getPublicMilestoneContent', () => {
    it('respond with public milestone content for milestone hash 202035466', async () => {
        const result = await traveler.getPublicMilestoneContent('202035466');
        return expect(result.ErrorCode).to.be.equal(PlatformErrorCodes.Success);
    });
});

describe('traveler#getPublicMilestones', () => {
    it('respond with public milestones', async () => {
        const result = await traveler.getPublicMilestones();
        return expect(result.ErrorCode).to.be.equal(PlatformErrorCodes.Success);
    });
});

describe('traveler#equipItem', () => {

    it('fails to equip item', async () => {
        traveler.oauth = await traveler.refreshToken(process.env.OAUTH_REFRESH_TOKEN);
        return expect(traveler.equipItem({
            characterId: '2305843009265042115',
            itemId: '1331482397',
            membershipType: BungieMembershipType.PSN,
        })).to.be.rejected;
    });

    it('fails using  method without oauth', async () => {
        return expect(() => {
            traveler.equipItem(null);
        }).to.throw;
    });
});

describe('traveler#refreshToken', () => {
    it('uses refresh token', async () => {
        const result = await traveler.refreshToken(process.env.OAUTH_REFRESH_TOKEN);
        return expect(result.refresh_token).to.be.a('string');
    });
    it('fails due to no refresh token provided', async () => {
        return expect(traveler.refreshToken('')).to.be.rejectedWith(rpErrors.StatusCodeError);
    });
});

describe('OAuthError#constructor', () => {
    it('creates a new OAuth error', async () => {
        return expect(new OauthError('New OauthError')).to.be.a.instanceOf(Error);
    });
});

describe('Traveler#downloadManifest and Manifest#constructor and Manifest#queryManifest', () => {
    it('Downloads the manifest and queries it with a simple query', async () => {
        const result = await traveler.getDestinyManifest();
        const filepath = await traveler.downloadManifest(result.Response.mobileWorldContentPaths.en, './manifest.content');
        const manifest = new Manifest(filepath);
        const queryResult = await manifest.queryManifest('SELECT name FROM sqlite_master WHERE type="table"');
        return expect(queryResult).to.be.a.instanceOf(Object);
    });
});

describe('Manifest', () => {
    it('Fails to create an instance', async () => {
        return expect(() => {
            const manifest = new Manifest('./test');
        }).to.throw;
    });
    it('Fails to query an invalid db', async () => {
        return expect(new Manifest('./output.gif').queryManifest('SELECT name FROM sqlite_master WHERE type="table"')).to.be.rejectedWith(Error);
    });
});
