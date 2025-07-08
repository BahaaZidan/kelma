/* eslint-disable */
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { WebsiteSelectModel, PageSelectModel, CommentSelectModel, UserSelectModel } from '$lib/server/db/schema';
import type { Context } from '$lib/server/graphql/context';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  URL: { input: URL; output: URL; }
  USCurrency: { input: any; output: any; }
};

export type Comment = Node & {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  page: Page;
  permissions: CommentViewerPermissions;
  published: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website: Website;
};

export type CommentEdge = Edge & {
  __typename?: 'CommentEdge';
  cursor?: Maybe<Scalars['String']['output']>;
  node: Comment;
};

export type CommentViewerPermissions = {
  __typename?: 'CommentViewerPermissions';
  approve: Scalars['Boolean']['output'];
  delete: Scalars['Boolean']['output'];
  edit: Scalars['Boolean']['output'];
};

export type CommentsConnection = Connection & {
  __typename?: 'CommentsConnection';
  edges: Array<CommentEdge>;
  pageInfo: PageInfo;
};

export type Connection = {
  edges: Array<Edge>;
  pageInfo: PageInfo;
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  pageId: Scalars['ID']['input'];
};

export type CreateWebsiteInput = {
  domains: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type DeleteCommentInput = {
  commentId: Scalars['ID']['input'];
};

export type Edge = {
  cursor?: Maybe<Scalars['String']['output']>;
  node: Node;
};

export type Mutation = {
  __typename?: 'Mutation';
  createComment: Comment;
  createWebsite: Website;
  deleteComment?: Maybe<Comment>;
  publishComment?: Maybe<Comment>;
  togglePageClosed?: Maybe<Page>;
  togglePagePreModeration?: Maybe<Page>;
  updateCommentContent?: Maybe<Comment>;
  updateWebsite?: Maybe<Website>;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateWebsiteArgs = {
  input: CreateWebsiteInput;
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationPublishCommentArgs = {
  input: PublishCommentInput;
};


export type MutationTogglePageClosedArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTogglePagePreModerationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCommentContentArgs = {
  input: UpdateCommentContentInput;
};


export type MutationUpdateWebsiteArgs = {
  input: UpdateWebsiteInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type Page = Node & {
  __typename?: 'Page';
  closed: Scalars['Boolean']['output'];
  comments: CommentsConnection;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permissions: PageViewerPermissions;
  preModeration: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  url?: Maybe<Scalars['URL']['output']>;
  website: Website;
};


export type PageCommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PageInput = {
  overrides?: InputMaybe<PageOverrides>;
  slug: Scalars['String']['input'];
};

export type PageOverrides = {
  name: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};

export type PageViewerPermissions = {
  __typename?: 'PageViewerPermissions';
  createComment: Scalars['Boolean']['output'];
  toggleClosed: Scalars['Boolean']['output'];
  togglePreModeration: Scalars['Boolean']['output'];
};

export type PublishCommentInput = {
  commentId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type UpdateCommentContentInput = {
  commentId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
};

export type UpdateWebsiteInput = {
  domains?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  preModeration?: InputMaybe<Scalars['Boolean']['input']>;
};

export type User = Node & {
  __typename?: 'User';
  balance: Scalars['USCurrency']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  websites: Array<Website>;
};

export type Website = Node & {
  __typename?: 'Website';
  domains: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  owner: User;
  page?: Maybe<Page>;
  preModeration: Scalars['Boolean']['output'];
};


export type WebsitePageArgs = {
  input: PageInput;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Connection: ( Omit<CommentsConnection, 'edges'> & { edges: Array<_RefType['CommentEdge']> } );
  Edge: ( Omit<CommentEdge, 'node'> & { node: _RefType['Comment'] } );
  Node: ( CommentSelectModel ) | ( PageSelectModel ) | ( UserSelectModel ) | ( WebsiteSelectModel );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<CommentSelectModel>;
  CommentEdge: ResolverTypeWrapper<Omit<CommentEdge, 'node'> & { node: ResolversTypes['Comment'] }>;
  CommentViewerPermissions: ResolverTypeWrapper<CommentViewerPermissions>;
  CommentsConnection: ResolverTypeWrapper<Omit<CommentsConnection, 'edges'> & { edges: Array<ResolversTypes['CommentEdge']> }>;
  Connection: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Connection']>;
  CreateCommentInput: CreateCommentInput;
  CreateWebsiteInput: CreateWebsiteInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteCommentInput: DeleteCommentInput;
  Edge: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Edge']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
  Page: ResolverTypeWrapper<PageSelectModel>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PageInput: PageInput;
  PageOverrides: PageOverrides;
  PageViewerPermissions: ResolverTypeWrapper<PageViewerPermissions>;
  PublishCommentInput: PublishCommentInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  USCurrency: ResolverTypeWrapper<Scalars['USCurrency']['output']>;
  UpdateCommentContentInput: UpdateCommentContentInput;
  UpdateWebsiteInput: UpdateWebsiteInput;
  User: ResolverTypeWrapper<UserSelectModel>;
  Website: ResolverTypeWrapper<WebsiteSelectModel>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Comment: CommentSelectModel;
  CommentEdge: Omit<CommentEdge, 'node'> & { node: ResolversParentTypes['Comment'] };
  CommentViewerPermissions: CommentViewerPermissions;
  CommentsConnection: Omit<CommentsConnection, 'edges'> & { edges: Array<ResolversParentTypes['CommentEdge']> };
  Connection: ResolversInterfaceTypes<ResolversParentTypes>['Connection'];
  CreateCommentInput: CreateCommentInput;
  CreateWebsiteInput: CreateWebsiteInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteCommentInput: DeleteCommentInput;
  Edge: ResolversInterfaceTypes<ResolversParentTypes>['Edge'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
  Page: PageSelectModel;
  PageInfo: PageInfo;
  PageInput: PageInput;
  PageOverrides: PageOverrides;
  PageViewerPermissions: PageViewerPermissions;
  PublishCommentInput: PublishCommentInput;
  Query: {};
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
  USCurrency: Scalars['USCurrency']['output'];
  UpdateCommentContentInput: UpdateCommentContentInput;
  UpdateWebsiteInput: UpdateWebsiteInput;
  User: UserSelectModel;
  Website: WebsiteSelectModel;
};

export type CommentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Page'], ParentType, ContextType>;
  permissions?: Resolver<ResolversTypes['CommentViewerPermissions'], ParentType, ContextType>;
  published?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<ResolversTypes['Website'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentEdge'] = ResolversParentTypes['CommentEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentViewerPermissionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentViewerPermissions'] = ResolversParentTypes['CommentViewerPermissions']> = {
  approve?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  delete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  edit?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentsConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentsConnection'] = ResolversParentTypes['CommentsConnection']> = {
  edges?: Resolver<Array<ResolversTypes['CommentEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Connection'] = ResolversParentTypes['Connection']> = {
  __resolveType: TypeResolveFn<'CommentsConnection', ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['Edge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Edge'] = ResolversParentTypes['Edge']> = {
  __resolveType: TypeResolveFn<'CommentEdge', ParentType, ContextType>;
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Node'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input'>>;
  createWebsite?: Resolver<ResolversTypes['Website'], ParentType, ContextType, RequireFields<MutationCreateWebsiteArgs, 'input'>>;
  deleteComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'input'>>;
  publishComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationPublishCommentArgs, 'input'>>;
  togglePageClosed?: Resolver<Maybe<ResolversTypes['Page']>, ParentType, ContextType, RequireFields<MutationTogglePageClosedArgs, 'id'>>;
  togglePagePreModeration?: Resolver<Maybe<ResolversTypes['Page']>, ParentType, ContextType, RequireFields<MutationTogglePagePreModerationArgs, 'id'>>;
  updateCommentContent?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationUpdateCommentContentArgs, 'input'>>;
  updateWebsite?: Resolver<Maybe<ResolversTypes['Website']>, ParentType, ContextType, RequireFields<MutationUpdateWebsiteArgs, 'input'>>;
};

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'Comment' | 'Page' | 'User' | 'Website', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type PageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']> = {
  closed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  comments?: Resolver<ResolversTypes['CommentsConnection'], ParentType, ContextType, Partial<PageCommentsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<ResolversTypes['PageViewerPermissions'], ParentType, ContextType>;
  preModeration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  website?: Resolver<ResolversTypes['Website'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageViewerPermissionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageViewerPermissions'] = ResolversParentTypes['PageViewerPermissions']> = {
  createComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  toggleClosed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  togglePreModeration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  viewer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export interface UsCurrencyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['USCurrency'], any> {
  name: 'USCurrency';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  balance?: Resolver<ResolversTypes['USCurrency'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  websites?: Resolver<Array<ResolversTypes['Website']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebsiteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Website'] = ResolversParentTypes['Website']> = {
  domains?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  page?: Resolver<Maybe<ResolversTypes['Page']>, ParentType, ContextType, RequireFields<WebsitePageArgs, 'input'>>;
  preModeration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Comment?: CommentResolvers<ContextType>;
  CommentEdge?: CommentEdgeResolvers<ContextType>;
  CommentViewerPermissions?: CommentViewerPermissionsResolvers<ContextType>;
  CommentsConnection?: CommentsConnectionResolvers<ContextType>;
  Connection?: ConnectionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Edge?: EdgeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  Page?: PageResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PageViewerPermissions?: PageViewerPermissionsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  URL?: GraphQLScalarType;
  USCurrency?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  Website?: WebsiteResolvers<ContextType>;
};

