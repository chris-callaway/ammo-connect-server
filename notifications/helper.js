module.exports = function (Config, Modules) {

    var self = this;
    var Helper = {};
    var BullhornAPI = Modules.Bullhorn.API;

    Helper.FormatBody = function (type, candidate, placement) {
        var body = "";
        if (type != 'placement_followup') {

            body = '<p style="margin-bottom: 0px;"><a target="_blank" href="https://cls32.bullhornstaffing.com/BullhornSTAFFING/UserProfile.cfm?userResultsUUID=&view=Overview&userID=' + candidate.id + '&noLogo=TRUE&profileType=Client">Candidate Name: ' + candidate.firstName + ' ' + candidate.lastName + '</a></p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Candidate Mobile: ' + candidate.mobile + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Candidate Phone: ' + candidate.phone + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Start Date: ' + Modules.moment(placement.dateBegin).tz("America/New_York").startOf('day').format('MM/DD/YYYY') + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Job Order: ' + placement.jobOrder_id + '</p><br/>';

            body += "<p>CLOSEST TO THE MONEY will always be your future starts on the board so please make sure you secure the bag!</p><p>Beware of \"Buyer's Remorse!\" IT IS A REAL THING! REINFORCE POSITIVE DECISION</p><ul><li>Keep in touch and ask for referrals, remember you did them a free service.</li><li>During that 'congratulations moment' after an acceptance, ask something along the lines of - \"what made you decide to take my call / work with me over all the other recruiters???\"</li><li>They will usually tell you good things about you and your approach, and the timing of your reaching out just being right.</li><li>Then ask them \"don't you think others deserve the same call / chance that you did?\"</li><li>Gaining referrals takes a little push sometimes, but it's an easy way to get candidates that nobody else has!</li><li>SALES ACCOUNT MANAGERS: MAKE SURE YOUR CLIENT KNOWS TO KEEP IN TOUCH! THE MARKET IS TOO COMPETITIVE TO NOT MAKE THEIR NEW EMPLOYEE FEEL AT HOME. YOU ARE THEIR CONSULTANT</li></ul>";

        } else {

            body = '<p style="margin-bottom: 0px;"><a target="_blank" href="https://cls32.bullhornstaffing.com/BullhornSTAFFING/UserProfile.cfm?userResultsUUID=&view=Overview&userID=' + candidate.id + '&noLogo=TRUE&profileType=Client">Candidate Name: ' + candidate.firstName + ' ' + candidate.lastName + '</a></p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Candidate Mobile: ' + candidate.mobile + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Candidate Phone: ' + candidate.phone + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Start Date: ' + Modules.moment(placement.dateBegin).tz("America/New_York").startOf('day').format('MM/DD/YYYY') + '</p>';
            body += '<p style="margin-top: 0px;margin-bottom: 0px;">Job Order: ' + placement.jobOrder_id + '</p><br/>';

            body += '<p style="color: red; font-size: 16px;">No commission is secure until the guarantee period has passed. AMs, ask how the candidate is doing as well so we can get client feedback (showing that we care) Catch any potential fall-outs early</p>';
            body += '<br />';
            body += '<p><span style="font-size: 24px; font-weight: bold;">REFERRALS</span>&nbsp;are a reason to continue reaching out.';
            body += '<p>Remember that you did them a free service, and the candidate paid nothing for it.  They owe you referrals.';
            body += '<p style="font-size: 9px;"><a style="color: #000; font-size: 9px;" href="www.altusjobs.com/candidate-referral">www.altusjobs.com/candidate-referral</a></p>';
        }

        body += '<span style="font-size: 14px;">Thank you,</span><br /><div style="color: rgb(0, 0, 0); font-family: Calibri,sans-serif; font-style: normal; font-variant-caps: normal; font-weight:normal; letter-spacing: normal; text-align: start;text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; font-size:11pt; margin: 0in 0in 0.0001pt;"><span style="font-size: 24pt;font-family: Impact, sans-serif; color: rgb(7, 68, 191);">ALTUS JOBS</span></div><br /><br /><br />';
        return body;
    };

    Helper.getWebsocketPoint = function () {
        return 'ws://10.0.35.22:3335';
    };

    Helper.getAltusJobsNotificationUserId = function () {
        return 109;
    };

    return Helper;
};