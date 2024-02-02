import AttributeDetailView from "@calcom/features/ee/teams/pages/team-attributes-detail-view";

import type { CalPageWrapper } from "@components/PageWrapper";
import PageWrapper from "@components/PageWrapper";

const Page = AttributeDetailView as CalPageWrapper;
Page.PageWrapper = PageWrapper;

export default Page;
